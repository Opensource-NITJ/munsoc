import { NextRequest, NextResponse } from "next/server";
import { uploadRefMap } from "../shared";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const GOOGLE_SHEET_WEBHOOK_URL =
  process.env.YPM_GOOGLE_SHEET_WEBHOOK_URL ||
  process.env.GOOGLE_SHEET_WEBHOOK_URL ||
  "";
const WEBHOOK_SECRET =
  process.env.YPM_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET || "";
const IMGBB_API_KEY = process.env.IMGBB_API_KEY || "";
const DEFAULT_PORTFOLIO_LIMIT = parseInt(
  process.env.YPM_PORTFOLIO_LIMIT || process.env.PORTFOLIO_LIMIT || "65",
  10,
);
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const NOTIFICATION_EMAILS =
  process.env.YPM_NOTIFICATION_EMAILS ||
  process.env.NOTIFICATION_EMAILS ||
  "nitjmunsoc@gmail.com";
const FROM_EMAIL = process.env.FROM_EMAIL || "MUNSoC <onboarding@resend.dev>";

const rateLimitStore = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000;
const MAX_SUBMISSIONS = 3;

// Stores past submission bodies per IP for rate limit alert
const rateLimitSubmissionLog = new Map<
  string,
  { timestamp: string; body: Record<string, string> }[]
>();

let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour

// Remembers last known good allotment data so temporary timeouts never flash to 0 seats
let lastSuccessfulAllotmentData: any = null;
let lastFetchTimestamp = 0;
let inFlightFetchPromise: Promise<any> | null = null;
let googleCooldownUntil = 0;
const FRESHNESS_TTL_MS = 5000; // 5-second micro-cache to prevent hammering Google Apps Script

async function fetchAllotmentFromGoogle(): Promise<any> {
  const now = Date.now();

  // 1. If within freshness TTL, return immediately
  if (
    lastSuccessfulAllotmentData &&
    now - lastFetchTimestamp < FRESHNESS_TTL_MS
  ) {
    return lastSuccessfulAllotmentData;
  }

  // 2. If Google is currently on rate-limit cooldown, serve last known good data immediately
  if (now < googleCooldownUntil && lastSuccessfulAllotmentData) {
    return lastSuccessfulAllotmentData;
  }

  // 3. Deduplicate in-flight requests
  if (inFlightFetchPromise) {
    return inFlightFetchPromise;
  }

  inFlightFetchPromise = (async () => {
    if (!GOOGLE_SHEET_WEBHOOK_URL) return null;
    try {
      const response = await fetch(
        WEBHOOK_SECRET
          ? `${GOOGLE_SHEET_WEBHOOK_URL}?secret=${WEBHOOK_SECRET}`
          : GOOGLE_SHEET_WEBHOOK_URL,
        {
          method: "GET",
          cache: "no-store",
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
            Accept: "application/json",
          },
          signal: AbortSignal.timeout(18000),
        },
      );

      const responseText = await response.text();
      let result: any = null;
      try {
        result = JSON.parse(responseText);
      } catch {
        console.warn(
          `[MUNSoC Register] Google script returned non-JSON (status ${response.status}). Using last known good allotment data.`,
        );
        googleCooldownUntil = Date.now() + 15000;
        return lastSuccessfulAllotmentData || null;
      }

      if (
        result &&
        (result.result === "success" || result.status === "success")
      ) {
        const allottedList = Array.isArray(result.allotted)
          ? result.allotted
          : Array.isArray(result.allottedPortfolios)
            ? result.allottedPortfolios
            : [];

        const payload = {
          success: true,
          allotted: allottedList,
          allottedPortfolios: allottedList,
          totalAllotted: allottedList.length,
          actualAllotted: Array.isArray(result.actualAllotted)
            ? result.actualAllotted
            : [],
          govCount: typeof result.govCount === "number" ? result.govCount : 0,
          oppCount: typeof result.oppCount === "number" ? result.oppCount : 0,
          sideLimit:
            typeof result.sideLimit === "number" ? result.sideLimit : 25,
          isGovCapped: Boolean(result.isGovCapped),
          isOppCapped: Boolean(result.isOppCapped),
          isClosed: Boolean(result.isClosed || result.closed),
          portfolioLimit:
            typeof result.portfolioLimit === "number"
              ? result.portfolioLimit
              : DEFAULT_PORTFOLIO_LIMIT,
        };

        lastSuccessfulAllotmentData = payload;
        lastFetchTimestamp = Date.now();
        googleCooldownUntil = 0;
        return payload;
      } else {
        googleCooldownUntil = Date.now() + 15000;
        return lastSuccessfulAllotmentData || null;
      }
    } catch (err: any) {
      console.warn(
        `[MUNSoC Register] Live Google script GET fetch failed (${err.name || err.message}).`,
      );
      googleCooldownUntil = Date.now() + 10000;
      return lastSuccessfulAllotmentData || null;
    } finally {
      inFlightFetchPromise = null;
    }
  })();

  return inFlightFetchPromise;
}

function escapeHtml(str: any): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

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
    const active = log.filter(
      (s) => now - Date.parse(s.timestamp) < RATE_LIMIT_WINDOW,
    );
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
  const activeTimestamps = timestamps.filter(
    (t) => now - t < RATE_LIMIT_WINDOW,
  );
  if (activeTimestamps.length === 0) {
    rateLimitStore.delete(ip);
  } else {
    rateLimitStore.set(ip, activeTimestamps);
  }

  // Dynamic cleanup for current IP's submission log if expired
  const log = rateLimitSubmissionLog.get(ip);
  if (log) {
    const activeLog = log.filter(
      (s) => now - Date.parse(s.timestamp) < RATE_LIMIT_WINDOW,
    );
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
  "x-real-ip",
]);

async function sendRateLimitAlert(
  ip: string,
  headers: Record<string, string>,
  currentBody: Record<string, string>,
) {
  if (!GOOGLE_SHEET_WEBHOOK_URL) return;
  try {
    const pastSubmissions = rateLimitSubmissionLog.get(ip) || [];
    const payload = {
      action: "rate_limit_alert",
      ip,
      headers,
      pastSubmissions,
      currentBody,
      timestamp: new Date().toISOString(),
    };

    fetch(GOOGLE_SHEET_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, secret: WEBHOOK_SECRET }),
      signal: AbortSignal.timeout(8000),
    }).catch((err) => {
      console.error("[MUNSoC Register] Rate limit alert webhook failed:", err);
    });
    console.log(
      `[MUNSoC Register] Rate limit alert dispatched to Google Apps Script for IP: ${ip}`,
    );
  } catch (err) {
    console.error("[MUNSoC Register] Failed to send rate limit alert:", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

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
      const contentLength = contentLengthHeader
        ? parseInt(contentLengthHeader, 10)
        : 0;

      if (contentLength > 0 && contentLength < 10240) {
        try {
          blockedBody = await req.json();
        } catch {
          /* ignore parse errors */
        }
      } else {
        blockedBody = { _status: "[BODY_OMITTED_OR_TOO_LARGE]" };
      }

      // Fire-and-forget alert to Google Apps Script Webhook
      await sendRateLimitAlert(ip, headerMap, blockedBody);

      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded. Maximum 3 submissions per hour allowed.",
        },
        { status: 429 },
      );
    }

    // Size check for general registration body to prevent DoS (do not rely solely on Content-Length)
    const rawBody = await req.text();
    if (rawBody.length > 10240) {
      return NextResponse.json(
        { success: false, error: "Payload too large." },
        { status: 413 },
      );
    }

    let body: Record<string, any>;
    try {
      body = JSON.parse(rawBody || "{}");
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload." },
        { status: 400 },
      );
    }
    const {
      name,
      email,
      whatsapp,
      institute,
      pref1,
      pref2,
      pref3,
      experience,
      committee: committeeRaw,
      transactionId: transactionIdRaw,
    } = body;
    const transactionId =
      typeof transactionIdRaw === "string" ? transactionIdRaw.trim() : "";
    const committee =
      typeof committeeRaw === "string" && committeeRaw.trim()
        ? committeeRaw.trim()
        : "Youth Parliament (YPM)";

    recordSubmission(ip, {
      name: String(name ?? ""),
      email: String(email ?? ""),
      whatsapp: String(whatsapp ?? ""),
      committee: String(committee),
      pref1: String(pref1 ?? ""),
      pref2: String(pref2 ?? ""),
      pref3: String(pref3 ?? ""),
      transactionId,
    });

    if (GOOGLE_SHEET_WEBHOOK_URL) {
      try {
        const checkResult = (await fetchAllotmentFromGoogle()) || {};
        const portfolioLimit =
          checkResult.portfolioLimit || DEFAULT_PORTFOLIO_LIMIT;
        const allottedList = Array.isArray(checkResult.allotted)
          ? checkResult.allotted
          : Array.isArray(checkResult.allottedPortfolios)
            ? checkResult.allottedPortfolios
            : [];
        const allottedCount = allottedList.length;

        if (
          checkResult.isClosed === true ||
          checkResult.closed === true ||
          (checkResult.result === "success" &&
            portfolioLimit > 0 &&
            allottedCount >= portfolioLimit)
        ) {
          return NextResponse.json(
            {
              success: false,
              error:
                "Registrations are closed because all delegate portfolios have been allotted.",
            },
            { status: 403 },
          );
        }
      } catch (checkErr) {
        console.error(
          "[MUNSoC Register] Failed to check registration closure status:",
          checkErr,
        );
      }
    }

    if (
      !name ||
      !email ||
      !whatsapp ||
      !pref1 ||
      !pref2 ||
      !pref3 ||
      !transactionId
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    let resolvedTransactionId = transactionId;
    if (transactionId.startsWith("MUNSOC-REF-")) {
      const base64Image = uploadRefMap.get(transactionId);
      if (!base64Image) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Upload session expired. Please re-upload your payment receipt.",
          },
          { status: 400 },
        );
      }
      uploadRefMap.delete(transactionId);

      if (base64Image && IMGBB_API_KEY) {
        try {
          const bodyParams = new URLSearchParams();
          bodyParams.append("image", base64Image);

          const response = await fetch(
            `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: bodyParams,
              signal: AbortSignal.timeout(15000),
            },
          );

          const uploadResult = await response.json();
          if (
            uploadResult.success &&
            uploadResult.data &&
            uploadResult.data.url
          ) {
            resolvedTransactionId = uploadResult.data.url;
          } else {
            console.error(
              "[MUNSoC Register] Late upload ImgBB API error:",
              uploadResult,
            );
          }
        } catch (uploadError) {
          console.error(
            "[MUNSoC Register] Late upload to ImgBB failed:",
            uploadError,
          );
        }
      }
    }

    if (!GOOGLE_SHEET_WEBHOOK_URL) {
      console.warn(
        "[MUNSoC Register] Warning: GOOGLE_SHEET_WEBHOOK_URL is not set.",
      );
      return NextResponse.json({
        success: true,
        message:
          "Demo mode: Registration received. (Please set GOOGLE_SHEET_WEBHOOK_URL in .env.local for Sheets sync)",
      });
    }

    const payload = {
      action: "register",
      committee,
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
    };

    const response = await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...payload, secret: WEBHOOK_SECRET }),
      signal: AbortSignal.timeout(15000),
    });

    const responseText = await response.text();
    let result: any = {};
    try {
      result = JSON.parse(responseText);
    } catch {
      console.warn(
        "[MUNSoC Register] Non-JSON response from Google Sheet Webhook:",
        responseText.slice(0, 300),
      );
      if (responseText.toLowerCase().includes("success") || response.ok) {
        result = { result: "success" };
      } else {
        result = { result: "error", error: responseText.slice(0, 200) };
      }
    }

    if (result.result === "success" || result.status === "success") {
      // Record this submission in the rate limiter
      recordSubmission(ip, {
        name,
        email,
        whatsapp: whatsapp || "",
        committee,
        pref1,
        pref2,
        pref3,
        transactionId: resolvedTransactionId,
      });

      // Optional: Dispatch Secretariat notification email via Resend API
      if (RESEND_API_KEY && NOTIFICATION_EMAILS) {
        try {
          const recipientEmails = NOTIFICATION_EMAILS.split(",")
            .map((e) => e.trim())
            .filter((e) => e.length > 0);

          if (recipientEmails.length > 0) {
            try {
              const resendRes = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${RESEND_API_KEY}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  from: FROM_EMAIL,
                  to: recipientEmails,
                  reply_to: email || undefined,
                  subject: `New YPM Registration: ${name}`,
                  html: `
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                      <div style="background-color: #0f172a; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; border-top: 4px solid #0284c7;">
                        <img src="https://munsoc.opensourcenitj.com/munsoc-white-blue.svg" alt="MUNSoC NITJ" width="48" height="48" style="display: block; margin: 0 auto 10px auto; border-radius: 8px;" />
                        <h2 style="color: #ffffff; font-size: 18px; font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: 1px;">MUNSoC NIT Jalandhar</h2>
                        <p style="color: #38bdf8; font-size: 12px; margin: 4px 0 0 0; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px;">Youth Parliament (YPM)</p>
                      </div>

                      <div style="padding: 20px 8px 0 8px;">
                        <h3 style="color: #0f172a; font-size: 16px; font-weight: 700; margin: 0 0 12px 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">
                          New Registration Submission Received
                        </h3>
                        <p style="font-size: 14px; color: #475569; margin: 0 0 16px 0; line-height: 1.5;">
                          A new delegate application has been submitted for the <strong>Youth Parliament (YPM)</strong>. Below are the registration details:
                        </p>

                        <table style="border-collapse: collapse; width: 100%; font-size: 13px; margin-bottom: 20px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                          <tbody>
                            <tr style="border-bottom: 1px solid #e2e8f0; background-color: #f8fafc;">
                              <td style="padding: 10px 14px; font-weight: 600; color: #64748b; width: 150px; border-right: 1px solid #e2e8f0;">Full Name</td>
                              <td style="padding: 10px 14px; font-weight: 700; color: #0f172a;">${escapeHtml(name)}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #e2e8f0;">
                              <td style="padding: 10px 14px; font-weight: 600; color: #64748b; border-right: 1px solid #e2e8f0;">Email Address</td>
                              <td style="padding: 10px 14px;"><a href="mailto:${escapeHtml(email)}" style="color: #0284c7; text-decoration: none; font-weight: 600;">${escapeHtml(email)}</a></td>
                            </tr>
                            <tr style="border-bottom: 1px solid #e2e8f0; background-color: #f8fafc;">
                              <td style="padding: 10px 14px; font-weight: 600; color: #64748b; border-right: 1px solid #e2e8f0;">WhatsApp Number</td>
                              <td style="padding: 10px 14px;"><a href="https://wa.me/${escapeHtml(whatsapp || "").replace(/[^0-9]/g, "")}" style="color: #0284c7; text-decoration: none; font-weight: 600;">${escapeHtml(whatsapp)}</a></td>
                            </tr>
                            <tr style="border-bottom: 1px solid #e2e8f0;">
                              <td style="padding: 10px 14px; font-weight: 600; color: #64748b; border-right: 1px solid #e2e8f0;">Institute / College</td>
                              <td style="padding: 10px 14px; color: #334155;">${escapeHtml(institute || "N/A")}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #e2e8f0; background-color: #f8fafc;">
                              <td style="padding: 10px 14px; font-weight: 600; color: #64748b; border-right: 1px solid #e2e8f0;">1st Preference</td>
                              <td style="padding: 10px 14px; font-weight: 700; color: #0284c7;">${escapeHtml(pref1)}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #e2e8f0;">
                              <td style="padding: 10px 14px; font-weight: 600; color: #64748b; border-right: 1px solid #e2e8f0;">2nd Preference</td>
                              <td style="padding: 10px 14px; color: #334155;">${escapeHtml(pref2)}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #e2e8f0; background-color: #f8fafc;">
                              <td style="padding: 10px 14px; font-weight: 600; color: #64748b; border-right: 1px solid #e2e8f0;">3rd Preference</td>
                              <td style="padding: 10px 14px; color: #334155;">${escapeHtml(pref3)}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #e2e8f0;">
                              <td style="padding: 10px 14px; font-weight: 600; color: #64748b; border-right: 1px solid #e2e8f0;">Transaction ID / Receipt</td>
                              <td style="padding: 10px 14px; font-family: monospace; font-weight: 700; color: #0f172a; word-break: break-all;">${escapeHtml(resolvedTransactionId)}</td>
                            </tr>
                            <tr>
                              <td style="padding: 10px 14px; font-weight: 600; color: #64748b; border-right: 1px solid #e2e8f0; vertical-align: top;">MUN Experience</td>
                              <td style="padding: 10px 14px; color: #334155; white-space: pre-wrap; line-height: 1.5;">${escapeHtml(experience || "None specified")}</td>
                            </tr>
                          </tbody>
                        </table>

                      </div>

                      <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 16px; font-size: 12px; color: #94a3b8; text-align: center;">
                        MUNSoC NITJ Web Platform Registration System
                      </div>
                    </div>
                  `,
                }),
                signal: AbortSignal.timeout(10000),
              });
              const resendData = await resendRes.json();
              if (!resendRes.ok) {
                console.error(
                  "[MUNSoC Register] Resend API error:",
                  resendData,
                );
              } else {
                console.log(
                  "[MUNSoC Register] Resend email dispatched successfully:",
                  resendData.id,
                );
              }
            } catch (err) {
              console.error("[MUNSoC Register] Resend fetch failed:", err);
            }
          }
        } catch (emailErr) {
          console.error(
            "[MUNSoC Register] Resend email dispatch failed:",
            emailErr,
          );
        }
      }

      return NextResponse.json({
        success: true,
        message: result.message || "Registration recorded successfully",
      });
    } else {
      console.error(
        "[MUNSoC Register] Google script error:",
        result.error || result,
      );
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to write to Google Sheet",
        },
        { status: 500 },
      );
    }
  } catch (err) {
    console.error("[MUNSoC Register] Error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";
    const rateLimited = isRateLimited(ip);

    if (!GOOGLE_SHEET_WEBHOOK_URL) {
      console.warn(
        "[MUNSoC Register] Warning: GOOGLE_SHEET_WEBHOOK_URL is not set.",
      );
      return NextResponse.json({
        success: true,
        allotted: [],
        allottedPortfolios: [],
        totalAllotted: 0,
        actualAllotted: [],
        govCount: 0,
        oppCount: 0,
        sideLimit: 25,
        isGovCapped: false,
        isOppCapped: false,
        isClosed: false,
        rateLimited,
      });
    }

    try {
      const data = await fetchAllotmentFromGoogle();
      if (data) {
        return NextResponse.json({
          ...data,
          rateLimited,
        });
      }
    } catch (fetchErr: any) {
      console.warn(
        `[MUNSoC Register] GET fetchAllotmentFromGoogle failed:`,
        fetchErr,
      );
    }

    return NextResponse.json({
      success: true,
      allotted: [],
      allottedPortfolios: [],
      totalAllotted: 0,
      actualAllotted: [],
      govCount: 0,
      oppCount: 0,
      sideLimit: 25,
      isGovCapped: false,
      isOppCapped: false,
      isClosed: false,
      rateLimited,
      fallback: true,
    });
  } catch (err) {
    console.error("[MUNSoC Register] GET Unexpected Error:", err);
    if (lastSuccessfulAllotmentData) {
      return NextResponse.json({
        ...lastSuccessfulAllotmentData,
        rateLimited: false,
      });
    }
    return NextResponse.json({
      success: true,
      allotted: [],
      allottedPortfolios: [],
      totalAllotted: 0,
      actualAllotted: [],
      govCount: 0,
      oppCount: 0,
      sideLimit: 25,
      isGovCapped: false,
      isOppCapped: false,
      isClosed: false,
      rateLimited: false,
      fallback: true,
    });
  }
}
