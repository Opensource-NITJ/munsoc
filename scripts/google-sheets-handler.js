/**
 * ==============================================================================
 * MUNSoC NIT Jalandhar — Google Sheets Webhook Handler (Google Apps Script)
 * ==============================================================================
 *
 * FEATURES:
 * 1. Webhook Endpoint: Receives delegate registrations from Next.js backend.
 * 2. Concurrency Safety: LockService prevents simultaneous write race conditions.
 * 3. Portfolio Allocation API: GET returns real-time list of allotted portfolios.
 * 4. Automated Emails (Built-in MailApp):
 *    - Delegate Acknowledgment Email upon submission.
 *    - Secretariat Notification Email with all registration & transaction details.
 *    - Portfolio Allotment Confirmation Email when Secretariat assigns a portfolio.
 *    - Rate Limit Security Alerts when suspicious submission spikes occur.
 * 5. Dropdown Validations & Colors:
 *    - Status Column (Column M): ["Pending", "Allotted", "Confirmed", "Waitlisted", "Rejected", "Cancelled"]
 *    - Email Sent Column (Column N): ["No", "Yes"]
 *    - Color-coded conditional formatting rules for all status pills.
 * 6. UI Toolbar Menu: One-click sheet formatter, allotment dispatcher, status checker.
 *
 * ==============================================================================
 */

// ==============================================================================
// CONFIGURATION CONSTANTS
// ==============================================================================

/**
 * OPTIONAL: If your Apps Script is standalone (created directly at script.google.com),
 * paste your Google Sheet ID or full URL below.
 * If you opened this via "Extensions > Apps Script" inside the Sheet, leave this empty ("").
 */
const SPREADSHEET_ID =
  PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID") || "";

// Recipient email(s) for Secretariat notifications & security alerts
const NOTIFICATION_EMAILS = "nitjmunsoc@gmail.com";

// Shared secret — must match WEBHOOK_SECRET in Next.js .env.local

const WEBHOOK_SECRET =
  PropertiesService.getScriptProperties().getProperty("WEBHOOK_SECRET") || "";
const SHEET_REGISTRATIONS = "Registrations";
const SHEET_REFERRALS = "Referrals";
const DEFAULT_PORTFOLIO_LIMIT = 65; // Default portfolio limit for YPM

// Status Dropdown Options
const STATUS_OPTIONS = [
  "Pending",
  "Allotted",
  "Confirmed",
  "Waitlisted",
  "Rejected",
  "Cancelled",
];

// Email Sent Dropdown Options
const EMAIL_SENT_OPTIONS = ["No", "Yes"];

// Registration Sheet Column Headers (15 Columns)
const REGISTRATION_HEADERS = [
  "Timestamp",
  "Full Name",
  "Email",
  "WhatsApp Number",
  "Institute / Organization",
  "Preference 1",
  "Preference 2",
  "Preference 3",
  "MUN Experience",
  "Transaction ID / Receipt URL",
  "Committee",
  "Allotted Portfolio",
  "Status",
  "Email Sent",
  "Email Sent At",
];

// Referral Tracking Column Headers (10 Columns)
const REFERRAL_HEADERS = [
  "Timestamp",
  "Ref Code",
  "Full URL",
  "IP Address",
  "City",
  "Region",
  "Country",
  "User Agent",
  "Referer",
  "Language",
];

// ==============================================================================
// CORE HELPER: RESOLVE SPREADSHEET SAFELY
// ==============================================================================

/**
 * Resolves the active or linked Spreadsheet safely, supporting both
 * container-bound scripts (Extensions > Apps Script) and standalone scripts.
 */
function getSpreadsheet() {
  // 1. If explicit SPREADSHEET_ID or URL is configured
  if (typeof SPREADSHEET_ID === "string" && SPREADSHEET_ID.trim() !== "") {
    const target = SPREADSHEET_ID.trim();
    try {
      if (target.includes("docs.google.com/spreadsheets")) {
        return SpreadsheetApp.openByUrl(target);
      }
      return SpreadsheetApp.openById(target);
    } catch (err) {
      Logger.log(
        "[MUNSoC] Error opening spreadsheet by SPREADSHEET_ID: " +
          err.toString(),
      );
    }
  }

  // 2. Try container-bound active spreadsheet
  try {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (e) {
    // ignore
  }

  // 3. Try active sheet's parent
  try {
    const activeSheet = SpreadsheetApp.getActiveSheet();
    if (activeSheet && activeSheet.getParent()) return activeSheet.getParent();
  } catch (e) {
    // ignore
  }

  // 4. Try looking up "MUNSoC YPM 2026 Registrations" in Google Drive
  try {
    if (typeof DriveApp !== "undefined") {
      const files = DriveApp.getFilesByName("MUNSoC YPM 2026 Registrations");
      if (files.hasNext()) {
        const file = files.next();
        return SpreadsheetApp.openById(file.getId());
      }
    }
  } catch (e) {
    // ignore
  }

  throw new Error(
    "Could not bind to Google Spreadsheet. If this script is a standalone script (from script.google.com), please paste your Google Sheet URL or ID into the SPREADSHEET_ID constant at line 31 of this script.",
  );
}

/**
 * Safe Alert Helper: Displays a UI modal when run inside Google Sheets UI,
 * or logs cleanly if executed headlessly / via Web App trigger.
 */
function safeAlert(title, message) {
  try {
    const ui = SpreadsheetApp.getUi();
    if (ui) {
      ui.alert(title, message, ui.ButtonSet.OK);
      return;
    }
  } catch (e) {
    // UI not available in Web App or standalone trigger context
  }
  Logger.log("[" + title + "] " + message);
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ==============================================================================
// CUSTOM SPREADSHEET UI MENU
// ==============================================================================

/**
 * Adds custom menu when the Google Spreadsheet is opened
 */
function onOpen() {
  try {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu("🏛️ MUNSoC Platform")
      .addItem("🚀 Initialize / Format Sheets & Dropdowns", "setupSheets")
      .addItem(
        "🔧 Fill Missing Status & Email Sent Defaults",
        "initializeDefaultValues",
      )
      .addItem("📧 Send Allotment Confirmation Emails", "sendAllotmentEmails")
      .addItem("📊 Check Allotment Count & Status", "checkAllotmentStatus")
      .addToUi();
  } catch (e) {
    Logger.log("[MUNSoC] onOpen skipped (headless context): " + e.toString());
  }
}

// ==============================================================================
// HTTP GET HANDLER
// ==============================================================================

/**
 * Handle HTTP GET Requests:
 * Returns the list of currently allotted portfolios and capacity status in JSON format.
 */
function doGet(e) {
  try {
    const params = (e && e.parameter) || {};

    // Authenticate: reject requests without the correct shared secret
    if (WEBHOOK_SECRET && params.secret !== WEBHOOK_SECRET) {
      return jsonResponse({
        result: "error",
        status: "error",
        error: "Unauthorized",
      });
    }

    const action = params.action || params.type || "allotted";

    if (action === "ping" || action === "health") {
      return jsonResponse({
        result: "success",
        status: "ok",
        timestamp: new Date().toISOString(),
      });
    }

    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_REGISTRATIONS);

    if (!sheet) {
      return jsonResponse({
        result: "success",
        status: "success",
        allotted: [],
        allottedPortfolios: [],
        totalAllotted: 0,
        portfolioLimit: DEFAULT_PORTFOLIO_LIMIT,
        isClosed: false,
        message: "Registrations sheet not initialized yet.",
      });
    }

    const lastRow = sheet.getLastRow();
    const allottedPortfolios = [];

    if (lastRow > 1) {
      // Column L is Index 12 ("Allotted Portfolio"), Column M is Index 13 ("Status")
      const data = sheet.getRange(2, 1, lastRow - 1, 15).getValues();
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const allottedPortfolio = String(row[11] || "").trim(); // Col L: Allotted Portfolio
        const status = String(row[12] || "")
          .trim()
          .toLowerCase(); // Col M: Status

        // Count as taken if portfolio is filled and not cancelled/rejected
        if (
          allottedPortfolio &&
          status !== "cancelled" &&
          status !== "rejected"
        ) {
          allottedPortfolios.push(allottedPortfolio);
        }
      }
    }

    const isClosed = allottedPortfolios.length >= DEFAULT_PORTFOLIO_LIMIT;

    return jsonResponse({
      result: "success",
      status: "success",
      allotted: allottedPortfolios,
      allottedPortfolios: allottedPortfolios,
      totalAllotted: allottedPortfolios.length,
      portfolioLimit: DEFAULT_PORTFOLIO_LIMIT,
      isClosed: isClosed,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return jsonResponse({
      result: "error",
      status: "error",
      error: error.toString(),
    });
  }
}

// ==============================================================================
// HTTP POST HANDLER
// ==============================================================================

/**
 * Handle HTTP POST Requests:
 * Safely appends registration submissions or referral tracking logs with script locks.
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  const hasLock = lock.tryLock(30000); // Wait up to 30s for lock

  if (!hasLock) {
    return jsonResponse({
      result: "error",
      status: "error",
      error: "Server busy. Please retry in a few seconds.",
    });
  }

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({
        result: "error",
        status: "error",
        error: "No POST body received.",
      });
    }

    let payload = {};
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (parseError) {
      return jsonResponse({
        result: "error",
        status: "error",
        error: "Malformed JSON payload: " + parseError.toString(),
      });
    }

    // Authenticate: reject requests without the correct shared secret
    if (WEBHOOK_SECRET && payload.secret !== WEBHOOK_SECRET) {
      return jsonResponse({
        result: "error",
        status: "error",
        error: "Unauthorized",
      });
    }

    const ss = getSpreadsheet();

    // 1. Rate Limit Security Alert Handler
    if (payload.action === "rate_limit_alert") {
      return handleRateLimitAlert(payload);
    }

    // 2. Referral Link Tracking Handler
    if (payload.action === "track" || (payload.ref && !payload.email)) {
      return handleReferralTracking(ss, payload);
    }

    // 3. Delegate Registration Handler
    return handleRegistration(ss, payload);
  } catch (error) {
    return jsonResponse({
      result: "error",
      status: "error",
      error: error.toString(),
    });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Process and append delegate registration + apply dropdown validation + trigger email notifications
 */
function handleRegistration(ss, payload) {
  let sheet = ss.getSheetByName(SHEET_REGISTRATIONS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_REGISTRATIONS);
    formatSheetHeaders(sheet, REGISTRATION_HEADERS, "#0284c7");
    applyDropdownsAndFormatting(sheet);
  }

  const timestamp = payload.timestamp || new Date().toISOString();
  const name = String(payload.name || "").trim();
  const email = String(payload.email || "").trim();
  const whatsapp = String(payload.whatsapp || "").trim();
  const institute = String(payload.institute || "N/A").trim();
  const pref1 = String(payload.pref1 || "").trim();
  const pref2 = String(payload.pref2 || "").trim();
  const pref3 = String(payload.pref3 || "").trim();
  const experience = String(payload.experience || "").trim();
  const transactionId = String(payload.transactionId || "").trim();
  const committee = String(
    payload.committee || "Youth Parliament (YPM)",
  ).trim();

  // Basic validation
  if (!name || !email || !pref1 || !transactionId) {
    return jsonResponse({
      result: "error",
      status: "error",
      error:
        "Missing required registration fields (name, email, pref1, or transactionId).",
    });
  }

  // Row Data corresponding to REGISTRATION_HEADERS
  const rowData = [
    timestamp,
    name,
    email,
    whatsapp,
    institute,
    pref1,
    pref2,
    pref3,
    experience,
    transactionId,
    committee,
    "", // Col L: Allotted Portfolio (Filled by Secretariat)
    "Pending", // Col M: Status Dropdown ("Pending", "Allotted", "Confirmed", "Waitlisted", "Rejected", "Cancelled")
    "No", // Col N: Email Sent ("No", "Yes")
    "", // Col O: Email Sent At
  ];

  sheet.appendRow(rowData);
  const lastRow = sheet.getLastRow();

  // Format the newly appended row
  const rowRange = sheet.getRange(lastRow, 1, 1, rowData.length);
  rowRange.setVerticalAlignment("middle");
  rowRange.setFontFamily("Arial");
  rowRange.setFontSize(10);

  // Apply Dropdown Data Validation for Status (Col M) and Email Sent (Col N) on this row
  try {
    const statusCell = sheet.getRange(lastRow, 13);
    const statusRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(STATUS_OPTIONS, true)
      .setAllowInvalid(false)
      .build();
    statusCell.setDataValidation(statusRule);

    const emailSentCell = sheet.getRange(lastRow, 14);
    const emailSentRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(EMAIL_SENT_OPTIONS, true)
      .setAllowInvalid(false)
      .build();
    emailSentCell.setDataValidation(emailSentRule);
  } catch (ruleErr) {
    Logger.log("[MUNSoC] DataValidation rule notice: " + ruleErr.toString());
  }

  // 1. Send Notification Email to Secretariat (nitjmunsoc@gmail.com)
  try {
    sendRegistrationNotificationToSecretariat(payload);
  } catch (emailErr) {
    Logger.log(
      "[MUNSoC] Secretariat notification failed: " + emailErr.toString(),
    );
  }

  // 2. Send Acknowledgment Email to Delegate
  try {
    sendRegistrationAcknowledgmentToDelegate(payload);
  } catch (delegateEmailErr) {
    Logger.log(
      "[MUNSoC] Delegate acknowledgment email failed: " +
        delegateEmailErr.toString(),
    );
  }

  return jsonResponse({
    result: "success",
    status: "success",
    message: "Registration recorded successfully.",
    row: lastRow,
  });
}

/**
 * High-Deliverability Email Dispatcher
 * - Uses GmailApp (authenticated via your Google account for SPF/DKIM compliance)
 * - Includes both HTML body and clean plain-text fallback (critical for Spam filters)
 * - Sets sender display name & valid replyTo address
 * - Falls back to MailApp if needed
 */
function sendEmailSafely(to, subject, htmlBody, plainTextBody) {
  const senderName = "MUNSoC NIT Jalandhar";
  const replyToAddress = NOTIFICATION_EMAILS || "nitjmunsoc@gmail.com";

  if (!plainTextBody) {
    plainTextBody = htmlBody
      .replace(/<style([\s\S]*?)<\/style>/gi, "")
      .replace(/<script([\s\S]*?)<\/script>/gi, "")
      .replace(/<\/div>/gi, "\n")
      .replace(/<\/tr>/gi, "\n")
      .replace(/<br\s*[\/]?>/gi, "\n")
      .replace(/<[^>]+>/gi, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/\n\s*\n/g, "\n\n")
      .trim();
  }

  const options = {
    htmlBody: htmlBody,
    name: senderName,
    replyTo: replyToAddress,
  };

  try {
    if (typeof GmailApp !== "undefined") {
      GmailApp.sendEmail(to, subject, plainTextBody, options);
      return true;
    }
  } catch (gmailErr) {
    Logger.log(
      "[MUNSoC] GmailApp failed, trying MailApp: " + gmailErr.toString(),
    );
  }

  MailApp.sendEmail({
    to: to,
    subject: subject,
    body: plainTextBody,
    htmlBody: htmlBody,
    name: senderName,
    replyTo: replyToAddress,
  });
  return true;
}

/**
 * Sends notification email to Secretariat
 */
function sendRegistrationNotificationToSecretariat(payload) {
  const committee = payload.committee || "Youth Parliament (YPM)";
  const name = payload.name || "Delegate";
  const email = payload.email || "";
  const whatsapp = payload.whatsapp || "";
  const institute = payload.institute || "N/A";
  const pref1 = payload.pref1 || "—";
  const pref2 = payload.pref2 || "—";
  const pref3 = payload.pref3 || "—";
  const txnId = payload.transactionId || "—";
  const experience = payload.experience || "None specified";

  const subject = `New Registration: ${name} — ${committee}`;
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 620px; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
      <div style="background-color: #0284c7; padding: 18px 24px; color: #ffffff;">
        <h2 style="margin: 0; font-size: 20px;">New ${escapeHtml(committee)} Registration</h2>
        <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">MUNSoC NIT Jalandhar Web Portal</p>
      </div>
      <div style="padding: 24px; background-color: #ffffff;">
        <p style="margin-top: 0; font-size: 14px; color: #334155;">A new delegate registration has been submitted:</p>
        <table style="border-collapse: collapse; width: 100%; font-size: 13px; border: 1px solid #e2e8f0;">
          <tbody>
            <tr style="border-bottom: 1px solid #e2e8f0; background-color: #f8fafc;">
              <td style="padding: 9px 12px; font-weight: bold; width: 140px; color: #475569;">Committee</td>
              <td style="padding: 9px 12px; font-weight: 600; color: #0284c7;">${escapeHtml(committee)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 9px 12px; font-weight: bold; color: #475569;">Delegate Name</td>
              <td style="padding: 9px 12px; font-weight: 600;">${escapeHtml(name)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0; background-color: #f8fafc;">
              <td style="padding: 9px 12px; font-weight: bold; color: #475569;">Email</td>
              <td style="padding: 9px 12px;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 9px 12px; font-weight: bold; color: #475569;">WhatsApp</td>
              <td style="padding: 9px 12px;"><a href="https://wa.me/${escapeHtml(whatsapp).replace(/[^0-9]/g, "")}">${escapeHtml(whatsapp)}</a></td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0; background-color: #f8fafc;">
              <td style="padding: 9px 12px; font-weight: bold; color: #475569;">Institute</td>
              <td style="padding: 9px 12px;">${escapeHtml(institute)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 9px 12px; font-weight: bold; color: #475569;">1st Preference</td>
              <td style="padding: 9px 12px; font-weight: 600; color: #0369a1;">${escapeHtml(pref1)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0; background-color: #f8fafc;">
              <td style="padding: 9px 12px; font-weight: bold; color: #475569;">2nd Preference</td>
              <td style="padding: 9px 12px;">${escapeHtml(pref2)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 9px 12px; font-weight: bold; color: #475569;">3rd Preference</td>
              <td style="padding: 9px 12px;">${escapeHtml(pref3)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0; background-color: #f8fafc;">
              <td style="padding: 9px 12px; font-weight: bold; color: #475569;">Transaction ID</td>
              <td style="padding: 9px 12px; font-family: monospace; font-weight: bold; color: #0f172a;">${escapeHtml(txnId)}</td>
            </tr>
            <tr>
              <td style="padding: 9px 12px; font-weight: bold; color: #475569; vertical-align: top;">MUN Experience</td>
              <td style="padding: 9px 12px; white-space: pre-wrap; line-height: 1.4;">${escapeHtml(experience)}</td>
            </tr>
          </tbody>
        </table>
        <p style="font-size: 11px; color: #94a3b8; margin-top: 18px;">Automated notification from MUNSoC Web Platform.</p>
      </div>
    </div>
  `;

  sendEmailSafely(NOTIFICATION_EMAILS, subject, htmlBody);
}

/**
 * Sends acknowledgment receipt email to the registered delegate
 */
function sendRegistrationAcknowledgmentToDelegate(payload) {
  const committee = payload.committee || "Youth Parliament (YPM)";
  const name = payload.name || "Delegate";
  const email = payload.email;
  const txnId = payload.transactionId || "—";
  const pref1 = payload.pref1 || "—";

  if (!email) return;

  const subject = `Registration Received: ${committee} — MUNSoC NIT Jalandhar`;
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #0284c7; padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 22px; font-weight: bold;">MUNSoC NIT Jalandhar</h1>
        <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Model United Nations Society, NITJ</p>
      </div>
      <div style="padding: 28px; background-color: #ffffff;">
        <h2 style="color: #0f172a; margin-top: 0; font-size: 18px;">Hello ${escapeHtml(name)},</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #475569;">
          Thank you for applying to participate in <strong>${escapeHtml(committee)}</strong> at MUNSoC NIT Jalandhar.
        </p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <div style="font-size: 13px; margin-bottom: 6px;"><strong>Committee:</strong> ${escapeHtml(committee)}</div>
          <div style="font-size: 13px; margin-bottom: 6px;"><strong>1st Preference:</strong> ${escapeHtml(pref1)}</div>
          <div style="font-size: 13px;"><strong>Transaction / Reference:</strong> <span style="font-family: monospace;">${escapeHtml(txnId)}</span></div>
        </div>

        <p style="font-size: 14px; line-height: 1.6; color: #475569;">
          Our Executive Board is currently reviewing submissions and verifying payment receipts. You will receive an official portfolio allotment email once your portfolio assignment is finalized.
        </p>

        <p style="font-size: 14px; line-height: 1.6; color: #475569;">
          If you have any questions, feel free to write to us at <a href="mailto:nitjmunsoc@gmail.com" style="color: #0284c7;">nitjmunsoc@gmail.com</a>.
        </p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin: 0;">
          Warm Regards,<br/>
          <strong>Secretariat & Executive Board</strong><br/>
          Model United Nations Society (MUNSoC)<br/>
          Dr. B. R. Ambedkar National Institute of Technology, Jalandhar
        </p>
      </div>
    </div>
  `;

  sendEmailSafely(email, subject, htmlBody);
}

/**
 * Handles Rate Limit Security Alerts from Next.js
 */
function handleRateLimitAlert(payload) {
  const ip = payload.ip || "unknown";
  const pastSubmissions = payload.pastSubmissions || [];
  const currentBody = payload.currentBody || {};
  const headers = payload.headers || {};

  const submissionsHtml = [
    ...pastSubmissions,
    { timestamp: new Date().toISOString(), body: currentBody },
  ]
    .map(
      (s, i) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px; font-weight: bold; color: #64748b; vertical-align: top;">#${i + 1}</td>
        <td style="padding: 8px; font-family: monospace; font-size: 11px; color: #64748b; vertical-align: top;">${escapeHtml(s.timestamp)}</td>
        <td style="padding: 8px; font-size: 12px;">
          <b>Name:</b> ${escapeHtml((s.body && s.body.name) || "—")}<br/>
          <b>Email:</b> ${escapeHtml((s.body && s.body.email) || "—")}<br/>
          <b>WhatsApp:</b> ${escapeHtml((s.body && s.body.whatsapp) || "—")}<br/>
          <b>TxnID:</b> <span style="font-family:monospace">${escapeHtml((s.body && s.body.transactionId) || "—")}</span>
        </td>
      </tr>`,
    )
    .join("");

  const headersHtml = Object.entries(headers)
    .map(
      ([k, v]) =>
        `<tr><td style="padding: 6px 8px; font-weight:600; color:#64748b; font-size:11px;">${escapeHtml(k)}</td><td style="padding: 6px 8px; font-family:monospace; font-size:11px;">${escapeHtml(v)}</td></tr>`,
    )
    .join("");

  const subject = `Security Alert: Registration Rate Limit Exceeded — IP: ${ip}`;
  const htmlBody = `
    <div style="font-family: sans-serif; max-width: 680px; color: #1e293b;">
      <h2 style="color: #dc2626; border-bottom: 2px solid #fecaca; padding-bottom: 8px;">Rate Limit Alert</h2>
      <p>A user from IP <code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;">${escapeHtml(ip)}</code> has exceeded the maximum submission rate limit and was blocked.</p>

      <h3 style="color: #0284c7; margin-top: 20px;">Submission History</h3>
      <table style="border-collapse: collapse; width: 100%; font-size: 13px; border: 1px solid #e2e8f0;">
        <thead><tr style="background:#f8fafc;"><th style="padding:8px;text-align:left;">#</th><th style="padding:8px;text-align:left;">Timestamp</th><th style="padding:8px;text-align:left;">Details</th></tr></thead>
        <tbody>${submissionsHtml}</tbody>
      </table>

      <h3 style="color: #0284c7; margin-top: 20px;">Diagnostic Headers</h3>
      <table style="border-collapse: collapse; width: 100%; font-size: 12px; border: 1px solid #e2e8f0;">
        <thead><tr style="background:#f8fafc;"><th style="padding:6px 8px;text-align:left;">Header</th><th style="padding:6px 8px;text-align:left;">Value</th></tr></thead>
        <tbody>${headersHtml}</tbody>
      </table>
    </div>
  `;

  sendEmailSafely(NOTIFICATION_EMAILS, subject, htmlBody);

  return jsonResponse({
    result: "success",
    status: "success",
    message: "Rate limit alert sent.",
  });
}

/**
 * Process and append referral link tracking event
 */
function handleReferralTracking(ss, payload) {
  let sheet = ss.getSheetByName(SHEET_REFERRALS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_REFERRALS);
    formatSheetHeaders(sheet, REFERRAL_HEADERS, "#0f172a");
  }

  const timestamp = payload.timestamp || new Date().toISOString();
  const refCode = String(payload.ref || "").trim();
  const url = String(payload.url || "").trim();
  const ip = String(payload.ip || "").trim();
  const city = String(payload.city || "").trim();
  const region = String(payload.region || "").trim();
  const country = String(payload.country || "").trim();
  const userAgent = String(payload.user_agent || "").trim();
  const referer = String(payload.referer || "").trim();
  const language = String(payload.accept_language || "").trim();

  const rowData = [
    timestamp,
    refCode,
    url,
    ip,
    city,
    region,
    country,
    userAgent,
    referer,
    language,
  ];

  sheet.appendRow(rowData);
  const lastRow = sheet.getLastRow();

  const rowRange = sheet.getRange(lastRow, 1, 1, rowData.length);
  rowRange.setVerticalAlignment("middle");
  rowRange.setFontFamily("Arial");
  rowRange.setFontSize(9);

  return jsonResponse({
    result: "success",
    status: "success",
    message: "Referral tracking logged.",
    row: lastRow,
  });
}

// ==============================================================================
// ALLOTMENT EMAIL SENDER
// ==============================================================================

/**
 * Bulk / Manual action to send allotment emails to delegates.
 * Triggered from the Custom Menu: "MUNSoC Platform > Send Allotment Confirmation Emails"
 */
function sendAllotmentEmails() {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_REGISTRATIONS);

  if (!sheet) {
    safeAlert("Error", "Registrations sheet not found.");
    return;
  }

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    safeAlert("Notice", "No delegate registrations found to process.");
    return;
  }

  const data = sheet.getRange(2, 1, lastRow - 1, 15).getValues();
  let sentCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < data.length; i++) {
    const rowIndex = i + 2;
    const name = String(data[i][1] || "").trim();
    const email = String(data[i][2] || "").trim();
    const pref1 = String(data[i][5] || "").trim();
    const committee = String(data[i][10] || "Youth Parliament (YPM)").trim();
    let allottedPortfolio = String(data[i][11] || "").trim();
    const status = String(data[i][12] || "")
      .trim()
      .toLowerCase();
    const emailSent = String(data[i][13] || "")
      .trim()
      .toLowerCase();

    // Send if status is 'allotted' or 'confirmed', and email has not been sent yet
    const isAllottedStatus = status === "allotted" || status === "confirmed";

    // If Column L was left blank by Secretariat, fallback to Preference 1
    if (!allottedPortfolio && isAllottedStatus && pref1) {
      allottedPortfolio = pref1;
      // Auto-populate Column L in the sheet
      sheet.getRange(rowIndex, 12).setValue(allottedPortfolio);
    }

    if (allottedPortfolio && isAllottedStatus && emailSent !== "yes") {
      try {
        const subject = `Portfolio Allotment: ${allottedPortfolio} — ${committee} | MUNSoC NITJ`;
        const htmlBody = `
          <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #0284c7; padding: 24px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 0.5px;">MUNSoC NIT Jalandhar</h1>
              <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;">Model United Nations Society, NITJ</p>
            </div>
            <div style="padding: 28px; background-color: #ffffff;">
              <h2 style="color: #0f172a; margin-top: 0;">Congratulations, ${escapeHtml(name)}!</h2>
              <p style="font-size: 14px; line-height: 1.6; color: #475569;">
                The Executive Board and Secretariat of MUNSoC are pleased to announce that you have been allotted the following portfolio for the upcoming conference:
              </p>
              
              <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 18px; margin: 24px 0; text-align: center;">
                <span style="font-size: 12px; font-weight: bold; text-transform: uppercase; color: #0284c7; letter-spacing: 1px; display: block; margin-bottom: 6px;">Allotted Portfolio</span>
                <span style="font-size: 20px; font-weight: bold; color: #0369a1;">${escapeHtml(allottedPortfolio)}</span>
                <span style="font-size: 13px; color: #64748b; display: block; margin-top: 6px;">Committee: <strong>${escapeHtml(committee)}</strong></span>
              </div>

              <h3 style="font-size: 16px; color: #0f172a; margin-top: 24px;">Next Steps:</h3>
              <ul style="font-size: 14px; line-height: 1.7; color: #475569; padding-left: 20px;">
                <li>Prepare your opening speeches and policy research according to the background guide.</li>
                <li>Join the official WhatsApp Delegate group using the link provided by the organizing team.</li>
                <li>Reach out to the Secretariat in case of any queries or background guide clarifications.</li>
              </ul>

              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0;" />
              <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin: 0;">
                Warm Regards,<br/>
                <strong>Secretariat & Executive Board</strong><br/>
                Model United Nations Society (MUNSoC)<br/>
                Dr. B. R. Ambedkar National Institute of Technology, Jalandhar<br/>
                Email: <a href="mailto:nitjmunsoc@gmail.com" style="color: #0284c7;">nitjmunsoc@gmail.com</a>
              </p>
            </div>
          </div>
        `;

        sendEmailSafely(email, subject, htmlBody);

        // Mark as sent in the sheet
        sheet.getRange(rowIndex, 14).setValue("Yes");
        sheet.getRange(rowIndex, 15).setValue(new Date().toISOString());
        sentCount++;
      } catch (emailError) {
        Logger.log(
          "[MUNSoC] Failed to send email to " +
            email +
            ": " +
            emailError.toString(),
        );
      }
    } else {
      skippedCount++;
    }
  }

  safeAlert(
    "Email Dispatch Complete",
    `Allotment emails sent: ${sentCount}\nSkipped (Pending/Already Sent): ${skippedCount}`,
  );
}

/**
 * Debug helper: Shows what the script reads from each row.
 * Run via Apps Script editor: select debugAllotmentRows → Run.
 * Then check View > Logs for the output.
 */
function debugAllotmentRows() {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_REGISTRATIONS);

  if (!sheet) {
    safeAlert("Debug", "Registrations sheet not found.");
    return;
  }

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    safeAlert("Debug", "No data rows found.");
    return;
  }

  const data = sheet.getRange(2, 1, lastRow - 1, 15).getValues();
  const lines = [];

  for (let i = 0; i < data.length; i++) {
    const rowIndex = i + 2;
    const name = String(data[i][1] || "").trim();
    const email = String(data[i][2] || "").trim();
    const pref1 = String(data[i][5] || "").trim();
    let allottedPortfolio = String(data[i][11] || "").trim();
    const statusRaw = data[i][12];
    const status = String(statusRaw || "")
      .trim()
      .toLowerCase();
    const emailSentRaw = data[i][13];
    const emailSent = String(emailSentRaw || "")
      .trim()
      .toLowerCase();

    const isAllottedStatus = status === "allotted" || status === "confirmed";
    const effectivePortfolio =
      allottedPortfolio || (isAllottedStatus ? pref1 : "");
    const hasPortfolio = !!effectivePortfolio;
    const notYetSent = emailSent !== "yes";
    const wouldSend = hasPortfolio && isAllottedStatus && notYetSent;

    lines.push(
      `Row ${rowIndex}: ${name} | portfolio="${effectivePortfolio}" (${allottedPortfolio ? "Custom" : "Fallback Pref1"}) | ` +
        `status="${status}" (${isAllottedStatus}) | emailSent="${emailSent}" (${notYetSent}) | ` +
        `→ WOULD SEND: ${wouldSend}`,
    );
    Logger.log(lines[lines.length - 1]);
  }

  safeAlert("Debug Output", lines.join("\n\n") || "No rows found.");
}

/**
 * Display Allotment Statistics dialog in Google Sheets
 */
function checkAllotmentStatus() {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_REGISTRATIONS);

  if (!sheet) {
    safeAlert("Notice", "Registrations sheet does not exist yet.");
    return;
  }

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    safeAlert("Status", "No registrations recorded yet.");
    return;
  }

  const data = sheet.getRange(2, 1, lastRow - 1, 15).getValues();
  let total = data.length;
  let allotted = 0;
  let pending = 0;
  let confirmed = 0;
  let rejected = 0;

  for (let i = 0; i < data.length; i++) {
    const portfolio = String(data[i][11] || "").trim();
    const status = String(data[i][12] || "")
      .trim()
      .toLowerCase();

    if (portfolio) allotted++;
    if (status === "confirmed") confirmed++;
    else if (status === "pending") pending++;
    else if (status === "rejected") rejected++;
  }

  safeAlert(
    "📊 Allotment Status",
    `Total Registrations: ${total}\nPortfolios Allotted: ${allotted} / ${DEFAULT_PORTFOLIO_LIMIT}\nConfirmed: ${confirmed}\nPending: ${pending}\nRejected: ${rejected}\nCapacity Remaining: ${Math.max(0, DEFAULT_PORTFOLIO_LIMIT - allotted)}`,
  );
}

// ==============================================================================
// ONE-CLICK SETUP & FORMATTER
// ==============================================================================

/**
 * One-click Setup: Creates sheets, sets up header styling, freezes top rows,
 * applies dropdown validation rules and conditional formatting colors.
 */
function setupSheets() {
  const ss = getSpreadsheet();

  // 1. Setup Registrations Sheet
  let regSheet = ss.getSheetByName(SHEET_REGISTRATIONS);
  if (!regSheet) {
    regSheet = ss.insertSheet(SHEET_REGISTRATIONS);
  }
  formatSheetHeaders(regSheet, REGISTRATION_HEADERS, "#0284c7");
  applyDropdownsAndFormatting(regSheet);
  initializeDefaultValues(regSheet); // Fill missing Status/Email Sent defaults

  // 2. Setup Referrals Sheet
  let refSheet = ss.getSheetByName(SHEET_REFERRALS);
  if (!refSheet) {
    refSheet = ss.insertSheet(SHEET_REFERRALS);
  }
  formatSheetHeaders(refSheet, REFERRAL_HEADERS, "#0f172a");

  // Delete default "Sheet1" if empty and others exist
  const sheet1 = ss.getSheetByName("Sheet1");
  if (sheet1 && ss.getSheets().length > 1) {
    try {
      ss.deleteSheet(sheet1);
    } catch (e) {
      // ignore
    }
  }

  safeAlert(
    "Setup Complete",
    "MUNSoC Sheets initialized successfully in '" +
      ss.getName() +
      "' with Status dropdowns, color formatting, and default values.",
  );
}

/**
 * Fills missing Status and Email Sent defaults on all existing data rows.
 * - Status (Col M): sets to "Pending" if blank
 * - Email Sent (Col N): sets to "No" if blank
 * Safe to re-run — only touches cells that are empty.
 * Can be triggered from the Apps Script editor or called from setupSheets.
 */
function initializeDefaultValues(sheet) {
  // Allow calling standalone from the menu without a sheet argument
  if (!sheet) {
    const ss = getSpreadsheet();
    sheet = ss.getSheetByName(SHEET_REGISTRATIONS);
    if (!sheet) {
      safeAlert("Error", "Registrations sheet not found.");
      return;
    }
  }

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return; // No data rows

  const dataRange = sheet.getRange(2, 13, lastRow - 1, 2); // Col M (Status) + Col N (Email Sent)
  const values = dataRange.getValues();

  let changed = 0;
  for (let i = 0; i < values.length; i++) {
    const statusVal = String(values[i][0] || "").trim();
    const emailSentVal = String(values[i][1] || "").trim();

    if (!statusVal) {
      values[i][0] = "Pending";
      changed++;
    }
    if (!emailSentVal) {
      values[i][1] = "No";
      changed++;
    }
  }

  if (changed > 0) {
    dataRange.setValues(values);
    Logger.log(
      "[MUNSoC] initializeDefaultValues: filled " + changed + " empty cell(s).",
    );
  }

  safeAlert(
    "Defaults Initialized",
    `Checked ${values.length} registration row(s).\nUpdated ${changed} blank cell(s) with defaults:\n\n• Status → "Pending"\n• Email Sent → "No"`,
  );
}

/**
 * Helper to apply dropdown data validation and color-coded conditional formatting
 */
function applyDropdownsAndFormatting(sheet) {
  const maxRows = Math.max(sheet.getMaxRows(), 500);

  // 1. Status Dropdown (Column M / Index 13)
  const statusRange = sheet.getRange(2, 13, maxRows - 1, 1);
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(STATUS_OPTIONS, true)
    .setAllowInvalid(false)
    .build();
  statusRange.setDataValidation(statusRule);

  // 2. Email Sent Dropdown (Column N / Index 14)
  const emailSentRange = sheet.getRange(2, 14, maxRows - 1, 1);
  const emailSentRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(EMAIL_SENT_OPTIONS, true)
    .setAllowInvalid(false)
    .build();
  emailSentRange.setDataValidation(emailSentRule);

  // 3. Conditional Formatting Rules for Status Column (Column M)
  const rules = [];

  // Pending -> Soft Yellow
  rules.push(
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo("Pending")
      .setBackground("#fef9c3")
      .setFontColor("#854d0e")
      .setRanges([statusRange])
      .build(),
  );

  // Allotted -> Soft Sky Blue
  rules.push(
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo("Allotted")
      .setBackground("#e0f2fe")
      .setFontColor("#0369a1")
      .setRanges([statusRange])
      .build(),
  );

  // Confirmed -> Soft Green
  rules.push(
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo("Confirmed")
      .setBackground("#dcfce7")
      .setFontColor("#15803d")
      .setRanges([statusRange])
      .build(),
  );

  // Waitlisted -> Soft Orange
  rules.push(
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo("Waitlisted")
      .setBackground("#ffedd5")
      .setFontColor("#9a3412")
      .setRanges([statusRange])
      .build(),
  );

  // Rejected -> Soft Red
  rules.push(
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo("Rejected")
      .setBackground("#fee2e2")
      .setFontColor("#991b1b")
      .setRanges([statusRange])
      .build(),
  );

  // Cancelled -> Soft Slate
  rules.push(
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo("Cancelled")
      .setBackground("#f1f5f9")
      .setFontColor("#475569")
      .setRanges([statusRange])
      .build(),
  );

  // Email Sent -> Yes (Green)
  rules.push(
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo("Yes")
      .setBackground("#dcfce7")
      .setFontColor("#15803d")
      .setRanges([emailSentRange])
      .build(),
  );

  sheet.setConditionalFormatRules(rules);
}

/**
 * Helper to style headers
 */
function formatSheetHeaders(sheet, headers, bgColor) {
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground(bgColor);
  headerRange.setFontColor("#ffffff");
  headerRange.setFontWeight("bold");
  headerRange.setFontSize(10);
  headerRange.setVerticalAlignment("middle");
  sheet.setRowHeight(1, 35);
  sheet.setFrozenRows(1);

  // Auto-resize columns
  for (let c = 1; c <= headers.length; c++) {
    sheet.autoResizeColumn(c);
  }
}

/**
 * Helper to build JSON responses for Google Apps Script Web App
 */
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
