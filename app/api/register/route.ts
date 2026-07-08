import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { uploadRefMap } from "../shared";

const GOOGLE_SHEET_WEBHOOK_URL = process.env.GOOGLE_SHEET_WEBHOOK_URL || "";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const NOTIFICATION_EMAILS = process.env.NOTIFICATION_EMAILS || "";
const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@resend.dev";
const IMGBB_API_KEY = process.env.IMGBB_API_KEY || "";

const rateLimitStore = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000;
const MAX_SUBMISSIONS = 3;

// Stores past submission bodies per IP for rate limit alert
const rateLimitSubmissionLog = new Map<string, { timestamp: string; body: Record<string, string> }[]>();

let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour

function cleanupStores() {
  const now = Date.now();
  for (const [ip, timestamps] of rateLimitStore.entries()) {
    const active = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);
    if (active.length === 0) {
      rateLimitStore.delete(ip);
    } else if (active.length !== timestamps.length) {
      rateLimitStore.set(ip, active);
    }
  }
  for (const [ip, log] of rateLimitSubmissionLog.entries()) {
    const active = log.filter((s) => now - Date.parse(s.timestamp) < RATE_LIMIT_WINDOW);
    if (active.length === 0) {
      rateLimitSubmissionLog.delete(ip);
    } else if (active.length !== log.length) {
      rateLimitSubmissionLog.set(ip, active);
    }
  }
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();

  // Periodic cleanup of all expired entries
  if (now - lastCleanup > CLEANUP_INTERVAL) {
    cleanupStores();
    lastCleanup = now;
  }

  const timestamps = rateLimitStore.get(ip) || [];
  const activeTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);
  if (activeTimestamps.length === 0) {
    rateLimitStore.delete(ip);
  } else {
    rateLimitStore.set(ip, activeTimestamps);
  }

  // Dynamic cleanup for current IP's submission log if expired
  const log = rateLimitSubmissionLog.get(ip);
  if (log) {
    const activeLog = log.filter((s) => now - Date.parse(s.timestamp) < RATE_LIMIT_WINDOW);
    if (activeLog.length === 0) {
      rateLimitSubmissionLog.delete(ip);
    } else if (activeLog.length !== log.length) {
      rateLimitSubmissionLog.set(ip, activeLog);
    }
  }

  return activeTimestamps.length >= MAX_SUBMISSIONS;
}

function recordSubmission(ip: string, body: Record<string, string>) {
  const now = Date.now();
  const timestamps = rateLimitStore.get(ip) || [];
  timestamps.push(now);
  rateLimitStore.set(ip, timestamps);

  const log = rateLimitSubmissionLog.get(ip) || [];
  const nextLog = [...log, { timestamp: new Date(now).toISOString(), body }]
    .filter((s) => now - Date.parse(s.timestamp) < RATE_LIMIT_WINDOW)
    .slice(-MAX_SUBMISSIONS);
  rateLimitSubmissionLog.set(ip, nextLog);
}

const SAFE_HEADERS = new Set([
  "accept",
  "accept-encoding",
  "accept-language",
  "connection",
  "content-length",
  "content-type",
  "host",
  "origin",
  "referer",
  "sec-ch-ua",
  "sec-ch-ua-mobile",
  "sec-ch-ua-platform",
  "sec-fetch-dest",
  "sec-fetch-mode",
  "sec-fetch-site",
  "user-agent",
  "x-forwarded-for",
  "x-real-ip"
]);

function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function sendRateLimitAlert(
  ip: string,
  headers: Record<string, string>,
  currentBody: Record<string, string>
) {
  if (!RESEND_API_KEY) return;
  try {
    const resend = new Resend(RESEND_API_KEY);
    const pastSubmissions = rateLimitSubmissionLog.get(ip) || [];

    const submissionsHtml = [...pastSubmissions, { timestamp: new Date().toISOString(), body: currentBody }]
      .map((s, i) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 8px; font-weight: bold; color: #64748b; vertical-align: top; white-space: nowrap;">#${i + 1}</td>
          <td style="padding: 8px; font-family: monospace; font-size: 11px; color: #64748b; vertical-align: top;">${escapeHtml(s.timestamp)}</td>
          <td style="padding: 8px; font-size: 12px;">
            <b>Name:</b> ${escapeHtml(s.body.name || "—")}<br/>
            <b>Email:</b> ${escapeHtml(s.body.email || "—")}<br/>
            <b>WhatsApp:</b> ${escapeHtml(s.body.whatsapp || "—")}<br/>
            <b>Pref1:</b> ${escapeHtml(s.body.pref1 || "—")}<br/>
            <b>TxnID:</b> <span style="font-family:monospace">${escapeHtml(s.body.transactionId || "—")}</span>
          </td>
        </tr>`
      ).join("");

    const headersHtml = Object.entries(headers)
      .map(([k, v]) => `<tr><td style="padding: 6px 8px; font-weight:600; color:#64748b; font-size:11px; white-space:nowrap;">${escapeHtml(k)}</td><td style="padding: 6px 8px; font-family:monospace; font-size:11px; word-break:break-all;">${escapeHtml(v)}</td></tr>`)
      .join("");

    const alertRecipients = (NOTIFICATION_EMAILS || "nitjmunsoc@gmail.com")
      .split(",")
      .map((e) => e.trim())
      .filter((e) => e.length > 0);

    await resend.emails.send({
      from: FROM_EMAIL,
      to: alertRecipients,
      subject: `⚠️ AIPPM Rate Limit Hit — IP: ${escapeHtml(ip)}`,
      html: `
        <div style="font-family: sans-serif; max-width: 700px; color: #1e293b;">
          <h2 style="color: #dc2626; border-bottom: 2px solid #fecaca; padding-bottom: 8px;">⚠️ Rate Limit Alert</h2>
          <p>A user from IP <code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;">${escapeHtml(ip)}</code> has exceeded the maximum of <strong>${MAX_SUBMISSIONS} submissions per hour</strong> and was blocked.</p>

          <h3 style="color: #0284c7; margin-top: 24px;">Submission History</h3>
          <table style="border-collapse: collapse; width: 100%; font-size: 13px; border: 1px solid #e2e8f0;">
            <thead><tr style="background:#f8fafc;">
              <th style="padding:8px; text-align:left;">#</th>
              <th style="padding:8px; text-align:left;">Timestamp</th>
              <th style="padding:8px; text-align:left;">Details</th>
            </tr></thead>
            <tbody>${submissionsHtml}</tbody>
          </table>

          <h3 style="color: #0284c7; margin-top: 24px;">Request Headers</h3>
          <table style="border-collapse: collapse; width: 100%; font-size: 12px; border: 1px solid #e2e8f0;">
            <thead><tr style="background:#f8fafc;">
              <th style="padding:6px 8px; text-align:left;">Header</th>
              <th style="padding:6px 8px; text-align:left;">Value</th>
            </tr></thead>
            <tbody>${headersHtml}</tbody>
          </table>

          <p style="font-size: 11px; color: #94a3b8; margin-top: 20px;">This alert was automatically generated by the MUNSoC Web Platform.</p>
        </div>
      `,
    });
    console.log(`[MUNSoC Register] Rate limit alert sent for IP: ${ip}`);
  } catch (err) {
    console.error("[MUNSoC Register] Failed to send rate limit alert:", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "127.0.0.1";

    if (isRateLimited(ip)) {
      // Collect request headers (using allowlist & redaction)
      const headerMap: Record<string, string> = {};
      req.headers.forEach((value, key) => {
        const lowerKey = key.toLowerCase();
        if (SAFE_HEADERS.has(lowerKey)) {
          headerMap[key] = value;
        } else {
          headerMap[key] = "[REDACTED]";
        }
      });

      // Parse body to include in the alert (best-effort, size-capped to prevent DoS)
      let blockedBody: Record<string, string> = {};
      const contentLengthHeader = req.headers.get("content-length");
      const contentLength = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;

      if (contentLength > 0 && contentLength < 10240) {
        try {
          blockedBody = await req.json();
        } catch {
          /* ignore parse errors */
        }
      } else {
        blockedBody = { _status: "[BODY_OMITTED_OR_TOO_LARGE]" };
      }

      // Fire-and-forget alert to nitjmunsoc@gmail.com
      await sendRateLimitAlert(ip, headerMap, blockedBody);

      return NextResponse.json(
        { success: false, error: "Rate limit exceeded. Maximum 3 submissions per hour allowed." },
        { status: 429 }
      );
    }

    // Size check for general registration body to prevent DoS (do not rely solely on Content-Length)
    const rawBody = await req.text();
    if (rawBody.length > 10240) {
      return NextResponse.json(
        { success: false, error: "Payload too large." },
        { status: 413 }
      );
    }

    let body: Record<string, any>;
    try {
      body = JSON.parse(rawBody || "{}");
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload." },
        { status: 400 }
      );
    }
    const { name, email, whatsapp, institute, pref1, pref2, pref3, experience, transactionId: transactionIdRaw } = body;
    const transactionId = typeof transactionIdRaw === "string" ? transactionIdRaw : "";
    recordSubmission(ip, { name: String(name ?? ""), email: String(email ?? ""), whatsapp: String(whatsapp ?? ""), pref1: String(pref1 ?? ""), pref2: String(pref2 ?? ""), pref3: String(pref3 ?? ""), transactionId });

    if (GOOGLE_SHEET_WEBHOOK_URL) {
      try {
        const checkResponse = await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
          method: "GET",
          cache: "no-store",
        });
        const checkResult = await checkResponse.json();
        const portfolioLimit = 88;
        const allottedCount = Array.isArray(checkResult.allotted) ? checkResult.allotted.length : 0;
        if (checkResult.result === "success" && allottedCount >= portfolioLimit) {
          return NextResponse.json(
            { success: false, error: "Registrations are closed because all delegate portfolios have been allotted." },
            { status: 403 }
          );
        }
      } catch (checkErr) {
        console.error("[MUNSoC Register] Failed to check registration closure status:", checkErr);
      }
    }

    if (!name || !email || !whatsapp || !pref1 || !pref2 || !pref3 || !transactionId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    let resolvedTransactionId = transactionId;
    if (transactionId.startsWith("MUNSOC-REF-")) {
      const base64Image = uploadRefMap.get(transactionId);
      if (!base64Image) {
        return NextResponse.json(
          { success: false, error: "Upload session expired. Please re-upload your payment receipt." },
          { status: 400 }
        );
      }
      uploadRefMap.delete(transactionId);

      if (base64Image && IMGBB_API_KEY) {
        try {
          const bodyParams = new URLSearchParams();
          bodyParams.append("image", base64Image);

          const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: bodyParams,
          });

          const uploadResult = await response.json();
          if (uploadResult.success && uploadResult.data && uploadResult.data.url) {
            resolvedTransactionId = uploadResult.data.url;
          } else {
            console.error("[MUNSoC Register] Late upload ImgBB API error:", uploadResult);
          }
        } catch (uploadError) {
          console.error("[MUNSoC Register] Late upload to ImgBB failed:", uploadError);
        }
      }
    }

    if (!GOOGLE_SHEET_WEBHOOK_URL) {
      console.warn("[MUNSoC Register] Warning: GOOGLE_SHEET_WEBHOOK_URL is not set.");
      recordSubmission(ip, {});
      return NextResponse.json({
        success: true,
        message: "Demo mode: Registration received. (Please set GOOGLE_SHEET_WEBHOOK_URL in .env.local for Sheets sync)",
      });
    }

    const response = await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        whatsapp,
        institute: institute || "",
        pref1,
        pref2,
        pref3,
        experience: experience || "",
        transactionId: resolvedTransactionId,
        timestamp: new Date().toISOString(),
      }),
    });

    const result = await response.json();

    if (result.result === "success") {
      // Record this submission in the rate limiter (with body for alert logging)
      recordSubmission(ip, { name, email, whatsapp: whatsapp || "", pref1, pref2, pref3, transactionId: resolvedTransactionId });
      if (RESEND_API_KEY && NOTIFICATION_EMAILS) {
        try {
          const resend = new Resend(RESEND_API_KEY);
          const recipientEmails = NOTIFICATION_EMAILS.split(",")
            .map((e) => e.trim())
            .filter((e) => e.length > 0);

          if (recipientEmails.length > 0) {
            const { data, error } = await resend.emails.send({
              from: FROM_EMAIL,
              to: recipientEmails,
              subject: `AIPPM Registration: ${name}`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; color: #333;">
                  <h2 style="color: #0284c7; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
                    New AIPPM Registration Received
                  </h2>
                  <p>Here are the details of the submission:</p>
                  <table style="border-collapse: collapse; width: 100%; border: 1px solid #e2e8f0; font-size: 13px;">
                    <thead>
                      <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                        <th style="padding: 10px; text-align: left; font-weight: bold; width: 160px; border-right: 1px solid #e2e8f0;">Field</th>
                        <th style="padding: 10px; text-align: left; font-weight: bold;">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style="border-bottom: 1px solid #e2e8f0;">
                        <td style="padding: 10px; font-weight: bold; border-right: 1px solid #e2e8f0; background-color: #fcfcfc;">Name</td>
                        <td style="padding: 10px;">${name}</td>
                      </tr>
                      <tr style="border-bottom: 1px solid #e2e8f0;">
                        <td style="padding: 10px; font-weight: bold; border-right: 1px solid #e2e8f0; background-color: #fcfcfc;">Email</td>
                        <td style="padding: 10px;"><a href="mailto:${email}">${email}</a></td>
                      </tr>
                      <tr style="border-bottom: 1px solid #e2e8f0;">
                        <td style="padding: 10px; font-weight: bold; border-right: 1px solid #e2e8f0; background-color: #fcfcfc;">WhatsApp Number</td>
                        <td style="padding: 10px;"><a href="https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}">${whatsapp}</a></td>
                      </tr>
                      <tr style="border-bottom: 1px solid #e2e8f0;">
                        <td style="padding: 10px; font-weight: bold; border-right: 1px solid #e2e8f0; background-color: #fcfcfc;">Institute</td>
                        <td style="padding: 10px;">${institute || "N/A"}</td>
                      </tr>
                      <tr style="border-bottom: 1px solid #e2e8f0;">
                        <td style="padding: 10px; font-weight: bold; border-right: 1px solid #e2e8f0; background-color: #fcfcfc;">1st Preference</td>
                        <td style="padding: 10px; font-weight: 600; color: #0284c7;">${pref1}</td>
                      </tr>
                      <tr style="border-bottom: 1px solid #e2e8f0;">
                        <td style="padding: 10px; font-weight: bold; border-right: 1px solid #e2e8f0; background-color: #fcfcfc;">2nd Preference</td>
                        <td style="padding: 10px;">${pref2}</td>
                      </tr>
                      <tr style="border-bottom: 1px solid #e2e8f0;">
                        <td style="padding: 10px; font-weight: bold; border-right: 1px solid #e2e8f0; background-color: #fcfcfc;">3rd Preference</td>
                        <td style="padding: 10px;">${pref3}</td>
                      </tr>
                      <tr style="border-bottom: 1px solid #e2e8f0;">
                        <td style="padding: 10px; font-weight: bold; border-right: 1px solid #e2e8f0; background-color: #fcfcfc;">Transaction ID</td>
                        <td style="padding: 10px; font-family: monospace; font-weight: 600; color: #0f172a;">${resolvedTransactionId}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px; font-weight: bold; border-right: 1px solid #e2e8f0; background-color: #fcfcfc; vertical-align: top;">MUN Experience</td>
                        <td style="padding: 10px; white-space: pre-wrap; line-height: 1.5;">${experience || "None specified"}</td>
                      </tr>
                    </tbody>
                  </table>
                  <p style="font-size: 11px; color: #64748b; margin-top: 20px;">
                    This email was automatically generated and sent to you from the MUNSoC Web Platform Registration Webhook.
                  </p>
                </div>
              `,
            });

            if (error) {
              console.error("[MUNSoC Register] Resend API error:", error);
            } else {
              console.log(`[MUNSoC Register] Notification email sent successfully, ID: ${data?.id}`);
            }
          }
        } catch (emailErr) {
          console.error("[MUNSoC Register] Resend sending failed:", emailErr);
        }
      }
      return NextResponse.json({ success: true });
    } else {
      console.error("[MUNSoC Register] Google script error:", result.error);
      return NextResponse.json(
        { success: false, error: "Failed to write to Google Sheet" },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("[MUNSoC Register] Error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "127.0.0.1";
    const rateLimited = isRateLimited(ip);

    if (!GOOGLE_SHEET_WEBHOOK_URL) {
      console.warn("[MUNSoC Register] Warning: GOOGLE_SHEET_WEBHOOK_URL is not set.");
      return NextResponse.json({ success: true, allotted: [], rateLimited });
    }

    const response = await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
      method: "GET",
      cache: "no-store",
    });

    const result = await response.json();

    if (result.result === "success") {
      return NextResponse.json({
        success: true,
        allotted: result.allotted || [],
        rateLimited,
      });
    } else {
      console.error("[MUNSoC Register] Google script GET error:", result.error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch allocation data", rateLimited },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("[MUNSoC Register] GET Error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
