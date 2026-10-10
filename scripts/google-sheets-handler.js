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
const SPREADSHEET_ID = "1Y_vpZ86pyUEZ0wqA0CtfZHG9KgeNVGlb_zmzlisbGIU";

// Recipient email(s) for Secretariat notifications & security alerts
const NOTIFICATION_EMAILS = "nitjmunsoc@gmail.com";

const WEBHOOK_SECRET =
  PropertiesService.getScriptProperties().getProperty("WEBHOOK_SECRET") ||
  "d911246e7d248f3e2f593d49819ed8490f26d59c9afc13c219c59bf5c005f95d";
const SHEET_REGISTRATIONS = "Registrations";
const SHEET_REFERRALS = "Referrals";
const SHEET_CACHE = "PortfolioCache"; // In-sheet cache storage for single-cell instant lookups
const DEFAULT_PORTFOLIO_LIMIT = 65; // Default portfolio limit for YPM
const SIDE_CAPACITY_LIMIT = 26; // 25 members per side (Government vs Opposition)

// Caching configuration for high-speed doGet responses
const CACHE_KEY_ALLOTTED = "cached_allotted_json";
const CACHE_EXPIRATION_SECONDS = 21600; // Cache for 6 hours (maximum supported by CacheService)
const PROP_KEY_CACHE = "MUNSOC_ALLOTTED_CACHE";
const PROP_KEY_CACHE_PART2 = "MUNSOC_ALLOTTED_CACHE_2";

// Categorized YPM Portfolios: Government (NDA / Ruling Coalition - 29 MPs)
const GOVERNMENT_MEMBERS = [
  "Smriti Irani (Former Union Minister)",
  "Nishikant Dubey (MP, Godda)",
  "Baijayant Panda (MP, Kendrapara)",
  "Manoj Tiwari (MP, North East Delhi)",
  "Raghav Chadha (MP (Rajya Sabha))",
  "Narendra Modi (Prime Minister)",
  "Amit Shah (Minister of Home Affairs)",
  "Rajnath Singh (Minister of Defence)",
  "S. Jaishankar (Minister of External Affairs)",
  "Nirmala Sitharaman (Minister of Finance)",
  "J. P. Nadda (Minister of Health / Leader of the House (RS))",
  "Kiren Rijiju (Minister of Parliamentary Affairs)",
  "Nitin Gadkari (Minister of Road Transport & Highways)",
  "Shivraj Singh Chouhan (Minister of Agriculture)",
  "Manohar Lal Khattar (Minister of Power & Housing)",
  "Dharmendra Pradhan (Minister of Education)",
  "Piyush Goyal (Minister of Commerce & Industry)",
  "Ashwini Vaishnaw (Minister of Railways, I&B, and IT)",
  "Jyotiraditya Scindia (Minister of Communications)",
  "Bhupender Yadav (Minister of Environment & Forests)",
  "Kinjarapu Ram Mohan Naidu (Minister of Civil Aviation)",
  "Lallan Singh (Minister of Panchayati Raj)",
  "Chirag Paswan (Minister of Food Processing Industries)",
  "H. D. Kumaraswamy (Minister of Heavy Industries)",
  "Jitan Ram Manjhi (Minister of MSME)",
  "Jayant Chaudhary (Minister of State (Skill Development))",
  "Tejasvi Surya (MP, Bangalore South)",
  "Anurag Thakur (MP, Hamirpur)",
  "Ravi Shankar Prasad (MP, Patna Sahib)",
  "Sambit Patra (MP, Puri)",
  "Sudhanshu Trivedi (MP (Rajya Sabha))",
  "Bansuri Swaraj (MP, New Delhi)",
  "Kangana Ranaut (MP, Mandi)",
  "Giriraj Singh (Minister of Textiles)",
];

// Categorized YPM Portfolios: Opposition (INDIA Bloc / Others - 35 MPs)
const OPPOSITION_MEMBERS = [
   "P. Chidambaram (MP (Rajya Sabha))",
  "Sharad Pawar (MP (Rajya Sabha))",
  "Rahul Gandhi (Leader of the Opposition (Lok Sabha))",
  "Mallikarjun Kharge (Leader of the Opposition (Rajya Sabha))",
  "Shashi Tharoor (MP, Thiruvananthapuram)",
  "Gaurav Gogoi (MP, Jorhat)",
  "K. C. Venugopal (MP, Alappuzha)",
  "Manish Tewari (MP, Chandigarh)",
  "Jairam Ramesh (MP (Rajya Sabha))",
  "Pramod Tiwari (MP (Rajya Sabha))",
  "Tariq Anwar (MP, Katihar)",
  "Akhilesh Yadav (MP, Kannauj)",
  "Dimple Yadav (MP, Mainpuri)",
  "Awadhesh Prasad (MP, Faizabad)",
  "Ram Gopal Yadav (MP (Rajya Sabha))",
  "Abhishek Banerjee (MP, Diamond Harbour)",
  "Mahua Moitra (MP, Krishnanagar)",
  "Derek O'Brien (MP (Rajya Sabha))",
  "Kalyan Banerjee (MP, Srerampur)",
  "Kanimozhi Karunanidhi (MP, Thoothukkudi)",
  "T. R. Baalu (MP, Sriperumbudur)",
  "A. Raja (MP, Nilgiris)",
  "Tiruchi Siva (MP (Rajya Sabha))",
  "Supriya Sule (MP, Baramati)",
  "Arvind Sawant (MP, South Mumbai)",
  "Sanjay Raut (MP (Rajya Sabha))",
  "Priyanka Chaturvedi (MP (Rajya Sabha))",
  "Misa Bharti (MP, Pataliputra)",
  "Manoj Kumar Jha (MP (Rajya Sabha))",
  "John Brittas (MP (Rajya Sabha))",
  "Amra Ram (MP, Sikar)",
  "Thol. Thirumavalavan (MP, Chidambaram)",
  "Sanjay Singh (MP (Rajya Sabha))",
  "Asaduddin Owaisi (MP, Hyderabad)",
  "Chandrashekhar Azad (MP, Nagina)",
  "Amritpal Singh (MP, Khadoor Sahib)",
  "Priyanka Gandhi Vadra (MP, Wayanad)",
  "Charanjit Singh Channi (MP, Jalandhar)",
];

/**
 * Helper to identify whether an MP belongs to Government or Opposition
 */
function getPortfolioSide(portfolioName) {
  if (!portfolioName) return "Unknown";
  const norm = String(portfolioName).trim().toLowerCase();
  for (let i = 0; i < GOVERNMENT_MEMBERS.length; i++) {
    if (GOVERNMENT_MEMBERS[i].trim().toLowerCase() === norm)
      return "Government";
  }
  for (let i = 0; i < OPPOSITION_MEMBERS.length; i++) {
    if (OPPOSITION_MEMBERS[i].trim().toLowerCase() === norm)
      return "Opposition";
  }
  return "Unknown";
}

// ==============================================================================
// HIGH-SPEED REAL-TIME CACHING ENGINE
// ==============================================================================

/**
 * Computes the complete allotment payload directly from the Registrations sheet.
 * Fast single-batch read of Columns L (Allotted Portfolio) and M (Status).
 */
function computeAllotmentPayload(sheet) {
  try {
    if (!sheet) {
      const ss = getSpreadsheet();
      sheet = ss.getSheetByName(SHEET_REGISTRATIONS);
    }
    if (!sheet) {
      return {
        result: "success",
        status: "success",
        allotted: [],
        allottedPortfolios: [],
        actualAllotted: [],
        totalAllotted: 0,
        govCount: 0,
        oppCount: 0,
        sideLimit: SIDE_CAPACITY_LIMIT,
        isGovCapped: false,
        isOppCapped: false,
        portfolioLimit: DEFAULT_PORTFOLIO_LIMIT,
        isClosed: false,
        timestamp: new Date().toISOString(),
        message: "Registrations sheet not initialized yet.",
      };
    }

    const lastRow = sheet.getLastRow();
    const actualAllotted = [];
    let govCount = 0;
    let oppCount = 0;

    if (lastRow > 1) {
      // Column L is Index 12 ("Allotted Portfolio"), Column M is Index 13 ("Status")
      // Batch fetch ONLY these 2 columns (L:M) for optimal performance
      const data = sheet.getRange(2, 12, lastRow - 1, 2).getValues();
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const allottedPortfolio = String(row[0] || "").trim();
        const status = String(row[1] || "")
          .trim()
          .toLowerCase();

        // Count as taken if portfolio is filled and not cancelled/rejected
        if (
          allottedPortfolio &&
          status !== "cancelled" &&
          status !== "rejected"
        ) {
          actualAllotted.push(allottedPortfolio);
          const side = getPortfolioSide(allottedPortfolio);
          if (side === "Government") {
            govCount++;
          } else if (side === "Opposition") {
            oppCount++;
          }
        }
      }
    }

    const isGovCapped = govCount >= SIDE_CAPACITY_LIMIT;
    const isOppCapped = oppCount >= SIDE_CAPACITY_LIMIT;

    // Effective allotted set starting with actually assigned portfolios
    const effectiveAllottedSet = new Set(actualAllotted);

    // If Government gets 25 members -> lock that entire side (all Government MPs allotted)
    if (isGovCapped) {
      for (let i = 0; i < GOVERNMENT_MEMBERS.length; i++) {
        effectiveAllottedSet.add(GOVERNMENT_MEMBERS[i]);
      }
    }

    // If Opposition gets 25 members -> lock that entire side (all Opposition MPs allotted)
    if (isOppCapped) {
      for (let i = 0; i < OPPOSITION_MEMBERS.length; i++) {
        effectiveAllottedSet.add(OPPOSITION_MEMBERS[i]);
      }
    }

    const effectiveAllottedList = Array.from(effectiveAllottedSet);
    const isClosed = isGovCapped && isOppCapped;

    return {
      result: "success",
      status: "success",
      allotted: effectiveAllottedList,
      allottedPortfolios: effectiveAllottedList,
      actualAllotted: actualAllotted,
      totalAllotted: actualAllotted.length,
      govCount: govCount,
      oppCount: oppCount,
      sideLimit: SIDE_CAPACITY_LIMIT,
      isGovCapped: isGovCapped,
      isOppCapped: isOppCapped,
      portfolioLimit: DEFAULT_PORTFOLIO_LIMIT,
      isClosed: isClosed,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    Logger.log("[MUNSoC] computeAllotmentPayload error: " + err.toString());
    return {
      result: "error",
      status: "error",
      error: err.toString(),
      allotted: [],
      allottedPortfolios: [],
      actualAllotted: [],
      totalAllotted: 0,
      govCount: 0,
      oppCount: 0,
      sideLimit: SIDE_CAPACITY_LIMIT,
      isGovCapped: false,
      isOppCapped: false,
      portfolioLimit: DEFAULT_PORTFOLIO_LIMIT,
      isClosed: false,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Persists allotment JSON in PropertiesService (ScriptProperties).
 * Unlike CacheService, ScriptProperties is distributed across Google's global cluster
 * and NEVER lost on container recycles or cold starts. Supports chunking up to 16 KB.
 */
function savePersistentAllotment(jsonStr) {
  if (!jsonStr) return;
  try {
    const props = PropertiesService.getScriptProperties();
    if (jsonStr.length <= 8000) {
      props.setProperty(PROP_KEY_CACHE, jsonStr);
      props.deleteProperty(PROP_KEY_CACHE_PART2);
    } else {
      props.setProperty(PROP_KEY_CACHE, jsonStr.substring(0, 8000));
      props.setProperty(PROP_KEY_CACHE_PART2, jsonStr.substring(8000));
    }
  } catch (e) {
    Logger.log("[MUNSoC] savePersistentAllotment error: " + e.toString());
  }
}

/**
 * Retrieves the persistent allotment JSON from ScriptProperties.
 * Guaranteed to exist across all instances and cold starts (~30ms read).
 */
function getPersistentAllotment() {
  try {
    const props = PropertiesService.getScriptProperties();
    const part1 = props.getProperty(PROP_KEY_CACHE);
    if (!part1) return null;
    const part2 = props.getProperty(PROP_KEY_CACHE_PART2);
    return part2 ? part1 + part2 : part1;
  } catch (e) {
    Logger.log("[MUNSoC] getPersistentAllotment error: " + e.toString());
    return null;
  }
}

/**
 * Updates the allotment cache with freshly calculated data from the sheet.
 * Stores in:
 * - RAM CacheService (L1: Instant 0-10ms)
 * - Distributed ScriptProperties (L2: Distributed across all Google instances ~30ms)
 * - In-sheet PortfolioCache cell A1 (L3: Persistent in Google Sheets itself ~100ms)
 * Returns the updated JSON string.
 */
function updateAllotmentCache(sheet) {
  try {
    const payload = computeAllotmentPayload(sheet);
    const jsonStr = JSON.stringify(payload);

    // 1. RAM Cache (L1: Instant 0-10ms)
    try {
      CacheService.getScriptCache().put(
        CACHE_KEY_ALLOTTED,
        jsonStr,
        CACHE_EXPIRATION_SECONDS,
      );
    } catch (cErr) {
      Logger.log("[MUNSoC] CacheService put warning: " + cErr.toString());
    }

    // 2. Persistent Storage (L2: Distributed across all Google instances ~30ms)
    savePersistentAllotment(jsonStr);

    // 3. In-sheet Persistent Cell Storage (L3: Tab 'PortfolioCache' Cell A1)
    try {
      const ss = (sheet && sheet.getParent && sheet.getParent()) || getSpreadsheet();
      if (ss) {
        let cacheSheet = ss.getSheetByName(SHEET_CACHE);
        if (!cacheSheet) {
          cacheSheet = ss.insertSheet(SHEET_CACHE);
        }
        cacheSheet.getRange("A1").setValue(jsonStr);
        cacheSheet.getRange("A2").setValue("Total Allotted");
        cacheSheet.getRange("B2").setValue(payload.totalAllotted);
        cacheSheet.getRange("A3").setValue("Government Count");
        cacheSheet.getRange("B3").setValue(payload.govCount);
        cacheSheet.getRange("A4").setValue("Opposition Count");
        cacheSheet.getRange("B4").setValue(payload.oppCount);
        cacheSheet.getRange("A5").setValue("Last Updated");
        cacheSheet.getRange("B5").setValue(payload.timestamp);
      }
    } catch (sErr) {
      Logger.log("[MUNSoC] In-sheet cache write note: " + sErr.toString());
    }

    return jsonStr;
  } catch (e) {
    Logger.log("[MUNSoC] updateAllotmentCache error: " + e.toString());
    return null;
  }
}

/**
 * Invalidate and immediately refresh the allotment cache across L1 and L2.
 */
function invalidateAllotmentCache(sheet) {
  try {
    CacheService.getScriptCache().remove(CACHE_KEY_ALLOTTED);
  } catch (e) {
    Logger.log("[MUNSoC] Cache invalidation notice: " + e.toString());
  }
  return updateAllotmentCache(sheet);
}

/**
 * Keep-Alive & Cache Warmup Function:
 * 1. Computes the latest allotment data directly from the Registrations sheet.
 * 2. Updates Google Apps Script CacheService so responses stay instant (~20-50ms).
 * 3. Keeps the Google Apps Script execution container active and awake, preventing cold starts.
 *
 * HOW TO RUN:
 * - Run via Apps Script time-driven trigger every 1 minute (built into installAllTriggers).
 * - Or ping via HTTP: GET https://script.google.com/.../exec?action=warmup&secret=...
 */
function keepAliveWarmup() {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_REGISTRATIONS);
    if (sheet) {
      updateAllotmentCache(sheet);
      Logger.log(
        "[MUNSoC] keepAliveWarmup: Allotment cache refreshed & container kept awake.",
      );
    }
  } catch (e) {
    Logger.log("[MUNSoC] keepAliveWarmup error: " + e.toString());
  }
}

/**
 * Backward-compatibility alias for existing trigger configurations.
 */
function refreshAllotmentCache() {
  keepAliveWarmup();
}

/**
 * Manual cache refresh invoked from UI toolbar menu.
 */
function manualCacheRefresh() {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_REGISTRATIONS);
    const payload = computeAllotmentPayload(sheet);
    updateAllotmentCache(sheet);

    safeAlert(
      "Cache Refreshed",
      `Website allotment cache successfully updated!\n\n` +
        `• Active Allotments: ${payload.totalAllotted}\n` +
        `• Government (NDA): ${payload.govCount} / ${payload.sideLimit} ${payload.isGovCapped ? "(LOCKED)" : ""}\n` +
        `• Opposition (INDIA): ${payload.oppCount} / ${payload.sideLimit} ${payload.isOppCapped ? "(LOCKED)" : ""}\n` +
        `• Portal Status: ${payload.isClosed ? "CLOSED (All Portfolios Allotted)" : "OPEN"}`,
    );
  } catch (e) {
    safeAlert("Error", "Failed to refresh cache: " + e.toString());
  }
}

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
  // 1. Prioritize container-bound active spreadsheet (fastest, in-memory, zero Drive locks)
  try {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (e) {
    // ignore
  }

  // 2. Try active sheet's parent
  try {
    const activeSheet = SpreadsheetApp.getActiveSheet();
    if (activeSheet && activeSheet.getParent()) return activeSheet.getParent();
  } catch (e) {
    // ignore
  }

  // 3. Fallback to explicit SPREADSHEET_ID if running as standalone script
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

  throw new Error(
    "Could not bind to Google Spreadsheet. If this script is a standalone script (from script.google.com), please verify SPREADSHEET_ID in CONFIGURATION CONSTANTS.",
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
        "⚡ Enable Real-time Auto-Allot & Cache Triggers",
        "installAllTriggers",
      )
      .addItem("🔄 Force Refresh Allotment Cache Now", "manualCacheRefresh")
      .addItem(
        "🔧 Fill Missing Status & Email Sent Defaults",
        "initializeDefaultValues",
      )
      .addItem("📧 Send Allotment Confirmation Emails", "sendAllotmentEmails")
      .addItem("📨 Send Conference Day Reminder Emails", "sendConferenceReminderEmails")
      .addItem("🧪 Send Test Reminder to Karthik", "testSendConferenceReminderEmail")
      .addItem("📊 Check Allotment Count & Status", "checkAllotmentStatus")
      .addToUi();
  } catch (e) {
    Logger.log("[MUNSoC] onOpen skipped (headless context): " + e.toString());
  }
}

/**
 * Simple Trigger: Runs automatically whenever any cell is edited.
 * Does not require trigger permissions. Immediately assigns the portfolio (Column L)
 * when Status is changed to Confirmed or Allotted, and immediately updates the cache.
 */
function onEdit(e) {
  handleSpreadsheetEdit(e, false);
}

/**
 * Installable Trigger: Runs when configured via Edit > Current project's triggers
 * or via the "⚡ Enable Real-time Auto-Allot & Cache Triggers" menu item.
 * Has full script authorization: assigns the portfolio, immediately sends
 * the official allotment confirmation email to the delegate, and updates the cache!
 */
function onEditTrigger(e) {
  handleSpreadsheetEdit(e, true);
}

/**
 * Structural Change Triggers:
 * Fires when rows are deleted, inserted, or grid layout is modified.
 * Catches row deletions that simple onEdit cannot detect!
 */
function onChange(e) {
  handleChangeEvent(e);
}

function onChangeTrigger(e) {
  handleChangeEvent(e);
}

function handleChangeEvent(e) {
  try {
    const ss = (e && e.source) || getSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_REGISTRATIONS);
    if (sheet) {
      updateAllotmentCache(sheet);
      Logger.log(
        "[MUNSoC] Cache updated on structural change event: " +
          (e ? e.changeType : "manual"),
      );
    }
  } catch (err) {
    Logger.log("[MUNSoC handleChangeEvent] Error: " + err.toString());
  }
}

/**
 * Core spreadsheet edit handler for both simple onEdit and installable onEditTrigger.
 * Handles:
 * 1. Setting Status (Col M) to 'Confirmed' or 'Allotted' -> Auto-allots Col L from preferences.
 * 2. Typing/Editing Allotted Portfolio (Col L) -> Automatically sets Status (Col M) to 'Allotted'.
 * 3. Immediate email dispatch when running via installable trigger.
 * 4. ALWAYS updates the allotment cache on ANY edit across the Registrations sheet!
 */
function handleSpreadsheetEdit(e, isInstallable) {
  if (!e || !e.range) return;

  try {
    const range = e.range;
    const sheet = range.getSheet();
    if (!sheet || sheet.getName() !== SHEET_REGISTRATIONS) return;

    const row = range.getRow();
    const col = range.getColumn();

    // Process auto-allot and email triggers only on data rows (row > 1) and columns 12 or 13
    if (row > 1 && (col === 12 || col === 13)) {
      // Read current row data (Columns A to O: 1 to 15)
      const rowData = sheet.getRange(row, 1, 1, 15).getValues()[0];
      const name = String(rowData[1] || "").trim();
      const email = String(rowData[2] || "").trim();
      const pref1 = String(rowData[5] || "").trim();
      const pref2 = String(rowData[6] || "").trim();
      const pref3 = String(rowData[7] || "").trim();
      const committee = String(rowData[10] || "Youth Parliament (YPM)").trim();
      let allottedPortfolio = String(rowData[11] || "").trim();
      let status = String(rowData[12] || "").trim();
      const statusLower = status.toLowerCase();
      const emailSent = String(rowData[13] || "")
        .trim()
        .toLowerCase();

      // CASE 1: Status (Column M / Col 13) was edited
      if (col === 13) {
        const isAllottedStatus =
          statusLower === "confirmed" || statusLower === "allotted";

        if (isAllottedStatus) {
          // If Column L (Allotted Portfolio) is empty, auto-assign from available preferences
          if (!allottedPortfolio) {
            allottedPortfolio = findAvailablePortfolio(
              sheet,
              row,
              pref1,
              pref2,
              pref3,
            );
            if (allottedPortfolio) {
              sheet.getRange(row, 12).setValue(allottedPortfolio);
            }
          }

          // When user clicked "Confirmed", change Status cell to "Allotted"
          if (statusLower === "confirmed") {
            sheet.getRange(row, 13).setValue("Allotted");
            status = "Allotted";
          }

          // Dispatch email immediately if not already sent
          if (allottedPortfolio && emailSent !== "yes") {
            const sent = sendSingleAllotmentEmail(
              sheet,
              row,
              name,
              email,
              committee,
              allottedPortfolio,
            );
            if (!sent && !isInstallable) {
              try {
                sheet
                  .getParent()
                  .toast(
                    "Portfolio allotted & Status set to Allotted!",
                    "YPM",
                    10,
                  );
              } catch (tErr) {}
            }
          }
        }
      }

      // CASE 2: Allotted Portfolio (Column L / Col 12) was edited directly
      if (col === 12) {
        const newPortfolio = String(range.getValue() || "").trim();
        if (newPortfolio) {
          // If status was Pending, Confirmed or blank, automatically update Status to Allotted
          if (
            !status ||
            statusLower === "pending" ||
            statusLower === "confirmed"
          ) {
            sheet.getRange(row, 13).setValue("Allotted");
            status = "Allotted";
          }

          // Dispatch email immediately if not already sent
          if (emailSent !== "yes") {
            const sent = sendSingleAllotmentEmail(
              sheet,
              row,
              name,
              email,
              committee,
              newPortfolio,
            );
            if (!sent && !isInstallable) {
              try {
                sheet
                  .getParent()
                  .toast(
                    "Portfolio assigned & Status set to Allotted!",
                    "YPM",
                    10,
                  );
              } catch (tErr) {}
            }
          }
        }
      }
    }

    // ALWAYS update cache immediately on EVERY edit across Registrations sheet!
    // Catches: changing status to Rejected/Cancelled, clearing portfolios, editing cells, deleting contents, etc.
    updateAllotmentCache(sheet);
  } catch (err) {
    Logger.log("[MUNSoC handleSpreadsheetEdit] Error: " + err.toString());
  }
}

/**
 * Finds the first available portfolio from delegate's preferences (Pref 1 -> Pref 2 -> Pref 3)
 * checking against already allotted portfolios and respecting the 25-member cap per side.
 */
function findAvailablePortfolio(sheet, currentRow, pref1, pref2, pref3) {
  const lastRow = sheet.getLastRow();
  const taken = new Set();
  let govCount = 0;
  let oppCount = 0;

  if (lastRow > 1) {
    // Columns L (12: Portfolio) and M (13: Status)
    const data = sheet.getRange(2, 12, lastRow - 1, 2).getValues();
    for (let i = 0; i < data.length; i++) {
      const r = i + 2;
      if (r === currentRow) continue; // skip the current row being edited

      const port = String(data[i][0] || "").trim();
      const stat = String(data[i][1] || "")
        .trim()
        .toLowerCase();

      if (port && stat !== "cancelled" && stat !== "rejected") {
        taken.add(port.toLowerCase());
        const side = getPortfolioSide(port);
        if (side === "Government") govCount++;
        else if (side === "Opposition") oppCount++;
      }
    }
  }

  const isGovCapped = govCount >= SIDE_CAPACITY_LIMIT;
  const isOppCapped = oppCount >= SIDE_CAPACITY_LIMIT;

  // Helper to test if a candidate portfolio is valid and not on a capped side
  function isAvailable(candidate) {
    if (!candidate) return false;
    const clean = candidate.trim();
    if (!clean || taken.has(clean.toLowerCase())) return false;
    const side = getPortfolioSide(clean);
    if (side === "Government" && isGovCapped) return false;
    if (side === "Opposition" && isOppCapped) return false;
    return true;
  }

  // Priority order: Preference 1 -> Preference 2 -> Preference 3
  if (isAvailable(pref1)) return pref1;
  if (isAvailable(pref2)) return pref2;
  if (isAvailable(pref3)) return pref3;

  // Fallback: If preferences are taken or on a capped side, find first free member from the uncapped side!
  if (!isGovCapped) {
    for (let i = 0; i < GOVERNMENT_MEMBERS.length; i++) {
      if (!taken.has(GOVERNMENT_MEMBERS[i].toLowerCase().trim())) {
        return GOVERNMENT_MEMBERS[i];
      }
    }
  }
  if (!isOppCapped) {
    for (let i = 0; i < OPPOSITION_MEMBERS.length; i++) {
      if (!taken.has(OPPOSITION_MEMBERS[i].toLowerCase().trim())) {
        return OPPOSITION_MEMBERS[i];
      }
    }
  }

  return pref1 || pref2 || pref3 || "";
}

/**
 * Programmatically installs all necessary triggers:
 * 1. onEditTrigger - on spreadsheet edit (with full authorization for email & cache)
 * 2. onChangeTrigger - on row deletion / structural change
 * 3. refreshAllotmentCache - periodic time-driven trigger every 1 minute
 */
function installAllTriggers() {
  const ss = getSpreadsheet();
  const existingTriggers = ScriptApp.getUserTriggers(ss);
  let projectTriggers = [];
  try {
    projectTriggers = ScriptApp.getProjectTriggers();
  } catch (e) {
    // Project triggers might be identical or restricted in container
  }

  let hasEdit = false;
  let hasChange = false;
  let hasTime = false;

  const allTriggers = [...existingTriggers, ...projectTriggers];
  for (let i = 0; i < allTriggers.length; i++) {
    const fn = allTriggers[i].getHandlerFunction();
    if (fn === "onEditTrigger") hasEdit = true;
    if (fn === "onChangeTrigger") hasChange = true;
    if (fn === "refreshAllotmentCache") hasTime = true;
  }

  if (!hasEdit) {
    ScriptApp.newTrigger("onEditTrigger").forSpreadsheet(ss).onEdit().create();
  }

  if (!hasChange) {
    ScriptApp.newTrigger("onChangeTrigger")
      .forSpreadsheet(ss)
      .onChange()
      .create();
  }

  if (!hasTime) {
    ScriptApp.newTrigger("refreshAllotmentCache")
      .timeBased()
      .everyMinutes(1)
      .create();
  }

  // Immediately warm up cache
  updateAllotmentCache();

  safeAlert(
    "Automation Triggers Active",
    "All automation triggers successfully installed and active:\n\n" +
      "1. ⚡ On Edit: Real-time auto-allot, emails & cache updates\n" +
      "2. 🗑️ On Change: Instant cache update when rows are deleted or added\n" +
      "3. ⏱️ Time-driven: Background cache refresh every minute\n\n" +
      "The website cache is now live and synchronized!",
  );
}

/**
 * Backward compatibility alias for the old menu item and existing trigger setups.
 */
function installEditTrigger() {
  installAllTriggers();
}

// ==============================================================================
// HTTP GET HANDLER
// ==============================================================================

/**
 * Handle HTTP GET Requests:
 * Returns the list of currently allotted portfolios and capacity status in JSON format.
 * High-speed cached path returns instantly in ~30-50ms.
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

    if (action === "ping" || action === "health" || action === "warmup") {
      // Warm up and refresh CacheService
      keepAliveWarmup();
      return jsonResponse({
        result: "success",
        status: "ok",
        warmed: true,
        timestamp: new Date().toISOString(),
      });
    }

    const forceRefresh =
      params.action === "refresh" ||
      params.refresh === "true" ||
      params.refresh === "1";

    // 1. FAST PATH L1: In-memory RAM Cache (0-10ms)
    const cache = CacheService.getScriptCache();
    if (!forceRefresh) {
      const cachedJson = cache.get(CACHE_KEY_ALLOTTED);
      if (cachedJson) {
        return ContentService.createTextOutput(cachedJson).setMimeType(
          ContentService.MimeType.JSON,
        );
      }

      // 2. FAST PATH L2: Distributed ScriptProperties (~30ms)
      // Guaranteed across ALL Google server clusters & cold starts without touching Sheet I/O!
      const persistentJson = getPersistentAllotment();
      if (persistentJson) {
        try {
          cache.put(
            CACHE_KEY_ALLOTTED,
            persistentJson,
            CACHE_EXPIRATION_SECONDS,
          );
        } catch (cErr) {}
        return ContentService.createTextOutput(persistentJson).setMimeType(
          ContentService.MimeType.JSON,
        );
      }

      // 3. FAST PATH L3: In-sheet Cache Cell (PortfolioCache!A1 - instant single cell read)
      try {
        const ss = getSpreadsheet();
        const cacheSheet = ss.getSheetByName(SHEET_CACHE);
        if (cacheSheet) {
          const sheetJson = String(cacheSheet.getRange("A1").getValue() || "").trim();
          if (sheetJson && sheetJson.startsWith("{")) {
            // Restore to L1 & L2 for subsequent hits
            try {
              cache.put(CACHE_KEY_ALLOTTED, sheetJson, CACHE_EXPIRATION_SECONDS);
            } catch (cErr) {}
            savePersistentAllotment(sheetJson);

            return ContentService.createTextOutput(sheetJson).setMimeType(
              ContentService.MimeType.JSON,
            );
          }
        }
      } catch (sheetErr) {
        Logger.log("[MUNSoC doGet] In-sheet cache read note: " + sheetErr.toString());
      }
    }

    // 4. SLOW PATH (First run setup or explicit action=refresh):
    // Read the spreadsheet, calculate allotments, and persist to L1, L2 and L3
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_REGISTRATIONS);
    const outputJson =
      updateAllotmentCache(sheet) ||
      JSON.stringify(computeAllotmentPayload(sheet));

    return ContentService.createTextOutput(outputJson).setMimeType(
      ContentService.MimeType.JSON,
    );
  } catch (error) {
    Logger.log("[MUNSoC doGet] Exception: " + error.toString());
    // Resilient fallback: If persistent cache exists, serve it even during an exception!
    const fallbackJson = getPersistentAllotment();
    if (fallbackJson) {
      return ContentService.createTextOutput(fallbackJson).setMimeType(
        ContentService.MimeType.JSON,
      );
    }
    return jsonResponse({
      result: "error",
      status: "error",
      error: error.toString(),
      allotted: [],
      allottedPortfolios: [],
      actualAllotted: [],
      totalAllotted: 0,
      govCount: 0,
      oppCount: 0,
      sideLimit: SIDE_CAPACITY_LIMIT,
      isGovCapped: false,
      isOppCapped: false,
      isClosed: false,
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

    // 3. Cache Refresh Request Handler
    if (payload.action === "refresh_cache") {
      updateAllotmentCache(ss.getSheetByName(SHEET_REGISTRATIONS));
      return jsonResponse({
        result: "success",
        status: "success",
        message: "Allotment cache refreshed.",
      });
    }

    // 4. Delegate Registration Handler
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
  updateAllotmentCache(sheet);
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

  // 2. Send Acknowledgment Email to Delegate
  try {
    sendRegistrationAcknowledgmentToDelegate(payload);
  } catch (delegateEmailErr) {
    Logger.log(
      "[MUNSoC] Delegate acknowledgment email failed: " +
        delegateEmailErr.toString(),
    );
  }

  // 3. Secretariat Notification Email is dispatched directly via Resend in Next.js
  // (Disabled here in Google Apps Script so duplicate emails from Gmail are not sent)
  /*
  try {
    sendSecretariatRegistrationNotification(payload);
  } catch (secEmailErr) {
    Logger.log(
      "[MUNSoC] Secretariat registration notification email failed: " +
        secEmailErr.toString(),
    );
  }
  */

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
 * Sends acknowledgment receipt email to the registered delegate
 */
function sendRegistrationAcknowledgmentToDelegate(payload) {
  const committee = payload.committee || "Youth Parliament (YPM)";
  const name = payload.name || "Delegate";
  const email = payload.email;
  const pref1 = payload.pref1 || "—";
  const pref2 = payload.pref2 || "—";
  const pref3 = payload.pref3 || "—";

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
          <div style="font-size: 13px; margin-bottom: 6px;"><strong>2nd Preference:</strong> ${escapeHtml(pref2)}</div>
          <div style="font-size: 13px; margin-bottom: 6px;"><strong>3rd Preference:</strong> ${escapeHtml(pref3)}</div>
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
 * Sends notification email to Secretariat when a new delegate registers
 */
function sendSecretariatRegistrationNotification(payload) {
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

  const subject = `New YPM Registration: ${name}`;
  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
      <div style="background-color: #0f172a; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; border-top: 4px solid #0284c7;">
        <img src="https://munsoc.opensourcenitj.com/munsoc-white-blue.svg" alt="MUNSoC NITJ" width="48" height="48" style="display: block; margin: 0 auto 10px auto; border-radius: 8px;" />
        <h2 style="color: #ffffff; font-size: 18px; font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: 1px;">MUNSoC NIT Jalandhar</h2>
        <p style="color: #38bdf8; font-size: 12px; margin: 4px 0 0 0; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px;">Youth Parliament (YPM)</p>
      </div>

      <div style="padding: 20px 8px 0 8px;">
        <h3 style="color: #0f172a; font-size: 16px; font-weight: 700; margin: 0 0 12px 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">New Registration Submission Received</h3>
        <p style="font-size: 14px; color: #475569; margin: 0 0 16px 0; line-height: 1.5;">A new delegate application has been submitted for the <strong>Youth Parliament (YPM)</strong>. Below are the registration details:</p>
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
              <td style="padding: 10px 14px;"><a href="https://wa.me/${escapeHtml(whatsapp).replace(/[^0-9]/g, "")}" style="color: #0284c7; text-decoration: none; font-weight: 600;">${escapeHtml(whatsapp)}</a></td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 10px 14px; font-weight: 600; color: #64748b; border-right: 1px solid #e2e8f0;">Institute / College</td>
              <td style="padding: 10px 14px; color: #334155;">${escapeHtml(institute)}</td>
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
              <td style="padding: 10px 14px; font-family: monospace; font-weight: 700; color: #0f172a; word-break: break-all;">${escapeHtml(txnId)}</td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; font-weight: 600; color: #64748b; border-right: 1px solid #e2e8f0; vertical-align: top;">MUN Experience</td>
              <td style="padding: 10px 14px; color: #334155; white-space: pre-wrap; line-height: 1.5;">${escapeHtml(experience)}</td>
            </tr>
          </tbody>
        </table>
        <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px;">
          <p style="margin: 0; font-size: 12px; color: #0369a1; line-height: 1.5;"><strong>Action Required:</strong> Review payment status in your YPM Google Sheet and switch Status to <strong>Confirmed</strong> to auto-allot portfolio and notify delegate.</p>
        </div>
      </div>
      <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 16px; font-size: 12px; color: #94a3b8; text-align: center;">MUNSoC NITJ Web Platform Registration System</div>
    </div>
  `;

  sendEmailSafely(NOTIFICATION_EMAILS, subject, htmlBody);
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
      const sent = sendSingleAllotmentEmail(
        sheet,
        rowIndex,
        name,
        email,
        committee,
        allottedPortfolio,
      );
      if (sent) {
        sentCount++;
      } else {
        skippedCount++;
      }
    } else {
      skippedCount++;
    }
  }

  updateAllotmentCache(sheet);

  safeAlert(
    "Email Dispatch Complete",
    `Allotment emails sent: ${sentCount}\nSkipped (Pending/Already Sent): ${skippedCount}`,
  );
}

/**
 * Dispatches a single allotment confirmation email to a delegate safely,
 * updating Column N ('Email Sent') and Column O ('Email Sent At') on success.
 */
function sendSingleAllotmentEmail(
  sheet,
  rowIndex,
  name,
  email,
  committee,
  allottedPortfolio,
) {
  if (!email || !allottedPortfolio) return false;

  // Check if already sent to prevent duplicate emails
  const currentSent = String(sheet.getRange(rowIndex, 14).getValue() || "")
    .trim()
    .toLowerCase();
  if (currentSent === "yes") return false;

  try {
    const subject = `Portfolio Allotment: ${allottedPortfolio} — ${committee} | MUNSoC NITJ`;
    const htmlBody = buildAllotmentEmailHtml(
      name,
      committee,
      allottedPortfolio,
    );

    sendEmailSafely(email, subject, htmlBody);

    sheet.getRange(rowIndex, 14).setValue("Yes");
    sheet.getRange(rowIndex, 15).setValue(new Date().toISOString());
    Logger.log("[MUNSoC] Allotment email dispatched to: " + email);
    return true;
  } catch (err) {
    Logger.log(
      "[MUNSoC] Failed to send allotment email to " +
        email +
        ": " +
        err.toString(),
    );
    return false;
  }
}

/**
 * Generates the responsive HTML confirmation email for portfolio allotment.
 */
function buildAllotmentEmailHtml(name, committee, allottedPortfolio) {
  return `
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
          <li>Join the official WhatsApp Delegate group using the button below to receive real-time announcements, schedule updates, and delegate coordination.</li>
          <li>Reach out to the Secretariat in case of any queries or background guide clarifications.</li>
        </ul>

        <!-- Official WhatsApp Delegate Group Button -->
        <div style="text-align: center; margin: 28px 0 20px 0;">
          <a href="https://chat.whatsapp.com/DntwTYWxgvaJIpjhpTQ577" target="_blank" style="display: inline-block; background-color: #25D366; color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; padding: 15px 32px; border-radius: 8px; box-shadow: 0 4px 14px rgba(37, 211, 102, 0.35); text-transform: uppercase; letter-spacing: 0.8px;">
            Join Official WhatsApp Group
          </a>
          <p style="font-size: 11px; color: #94a3b8; margin: 8px 0 0 0; word-break: break-all;">
            Or click / copy: <a href="https://chat.whatsapp.com/DntwTYWxgvaJIpjhpTQ577" style="color: #0284c7; text-decoration: underline;">https://chat.whatsapp.com/DntwTYWxgvaJIpjhpTQ577</a>
          </p>
        </div>

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
  let govAllotted = 0;
  let oppAllotted = 0;

  for (let i = 0; i < data.length; i++) {
    const portfolio = String(data[i][11] || "").trim();
    const status = String(data[i][12] || "")
      .trim()
      .toLowerCase();

    if (portfolio && status !== "cancelled" && status !== "rejected") {
      allotted++;
      const side = getPortfolioSide(portfolio);
      if (side === "Government") govAllotted++;
      else if (side === "Opposition") oppAllotted++;
    }

    if (status === "confirmed" || status === "allotted") confirmed++;
    else if (status === "pending") pending++;
    else if (status === "rejected") rejected++;
  }

  const govCapMsg =
    govAllotted >= SIDE_CAPACITY_LIMIT
      ? "🔒 (FULL - 25 CAP REACHED)"
      : `(${SIDE_CAPACITY_LIMIT - govAllotted} spots left)`;
  const oppCapMsg =
    oppAllotted >= SIDE_CAPACITY_LIMIT
      ? "🔒 (FULL - 25 CAP REACHED)"
      : `(${SIDE_CAPACITY_LIMIT - oppAllotted} spots left)`;

  safeAlert(
    "📊 YPM Parliamentary Balance Status",
    `Total Registrations: ${total}\n` +
      `Active Allotments: ${allotted} / 50\n\n` +
      `🏛️ Government (NDA): ${govAllotted} / ${SIDE_CAPACITY_LIMIT} ${govCapMsg}\n` +
      `⚖️ Opposition (INDIA): ${oppAllotted} / ${SIDE_CAPACITY_LIMIT} ${oppCapMsg}\n\n` +
      `Pending Review: ${pending}\n` +
      `Rejected: ${rejected}`,
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

  // Auto-install all automation triggers (edit, change & periodic refresh)
  try {
    installAllTriggers();
  } catch (triggerErr) {
    Logger.log("[MUNSoC] installAllTriggers notice: " + triggerErr.toString());
  }

  updateAllotmentCache(regSheet);

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
    updateAllotmentCache(sheet);
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

// ==============================================================================
// CONFERENCE DAY REMINDER EMAIL
// ==============================================================================

/**
 * Sends a conference day reminder email to all delegates with status "Allotted".
 * Includes event details (date, venue, reporting time), their locked portfolio,
 * the detailed schedule via Instagram link, and contact information.
 *
 * Triggered from the Custom Menu:
 *   "MUNSoC Platform > Send Conference Day Reminder Emails"
 *
 * Or run directly from the Apps Script editor:
 *   Select sendConferenceReminderEmails → Run
 */
function sendConferenceReminderEmails() {
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

  // 1. Identify all eligible recipients first so we have the exact total count
  const eligible = [];
  let skippedCount = 0;

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const name = String(row[1] || "").trim();
    const email = String(row[2] || "").trim();
    const rawCommittee = String(row[10] || "").trim();
    const committee =
      !rawCommittee ||
      rawCommittee.toLowerCase().includes("youth parliament") ||
      rawCommittee.toLowerCase().includes("ypm")
        ? "Youth Parliament (AIPPM)"
        : rawCommittee;
    const allottedPortfolio = String(row[11] || "").trim();
    const status = String(row[12] || "").trim().toLowerCase();

    const isAllottedStatus = status === "allotted" || status === "confirmed";
    if (name && email && allottedPortfolio && isAllottedStatus) {
      eligible.push({
        rowIndex: i + 2,
        name: name,
        email: email,
        committee: committee,
        allottedPortfolio: allottedPortfolio,
      });
    } else {
      skippedCount++;
    }
  }

  const total = eligible.length;
  if (total === 0) {
    safeAlert("Notice", "No allotted or confirmed delegates found to send reminders to.");
    return;
  }

  let sentCount = 0;
  const failureList = [];

  for (let i = 0; i < eligible.length; i++) {
    const item = eligible[i];
    const firstName = item.name.split(/\s+/)[0] || item.name;

    try {
      const subject =
        "Conference Day Reminder: Youth Parliament (AIPPM) — 18th October | MUNSoC NITJ";

      // Parse portfolio for HTML & plain-text generation
      let portfolioName = item.allottedPortfolio;
      let portfolioPosition = "";
      const parenMatch = String(item.allottedPortfolio || "").match(/^([^(]+?)\s*\((.+)\)\s*$/);
      if (parenMatch) {
        portfolioName = parenMatch[1].trim();
        portfolioPosition = parenMatch[2].trim();
      }
      const side = getPortfolioSide(item.allottedPortfolio);
      const sideLabel =
        side === "Government"
          ? "Government (NDA Coalition)"
          : side === "Opposition"
            ? "Opposition (INDIA Bloc)"
            : "";

      const htmlBody = buildConferenceReminderHtml(
        firstName,
        item.name,
        item.committee,
        item.allottedPortfolio,
      );

      // High-deliverability anti-spam plain text alternative
      const plainTextBody = buildConferenceReminderPlainText(
        item.name,
        portfolioName,
        portfolioPosition,
        sideLabel,
      );

      sendEmailSafely(item.email, subject, htmlBody, plainTextBody);
      sentCount++;

      // Progress output requirement: <name sent> "x/total"
      const progressMessage = item.name + " sent " + sentCount + "/" + total;
      Logger.log("[MUNSoC] " + progressMessage);

      // Real-time spreadsheet UI toast notification
      try {
        ss.toast(progressMessage, "MUNSoC Reminders", 4);
      } catch (tErr) {}

      // Natural throttle delay to protect sender domain reputation and avoid spam burst detection
      Utilities.sleep(800);
    } catch (err) {
      Logger.log("[MUNSoC] Error sending reminder to " + item.email + ": " + err.toString());
      failureList.push(item.name + " (" + item.email + "): " + err.message);
    }
  }

  const summary =
    "Conference Reminder Dispatch Complete!\n\n" +
    "• Successfully Sent: " + sentCount + " / " + total + "\n" +
    "• Skipped (Pending / No Portfolio): " + skippedCount +
    (failureList.length > 0 ? "\n• Failures (" + failureList.length + "):\n" + failureList.join("\n") : "");

  safeAlert("Dispatch Report", summary);
}

/**
 * Builds clean, comprehensive plain-text alternative body.
 * Critical for spam filters (ensures high text parity with HTML body).
 */
function buildConferenceReminderPlainText(
  fullName,
  portfolioName,
  portfolioPosition,
  sideLabel,
) {
  let portfolioDisplay = portfolioName;
  if (portfolioPosition) {
    portfolioDisplay += " (" + portfolioPosition + ")";
  }
  if (sideLabel) {
    portfolioDisplay += " - " + sideLabel;
  }

  return [
    "Good Day " + fullName + ",",
    "",
    "We hope this message finds you well. This is an official reminder that the Youth Parliament (AIPPM) hosted by MUNSoC, NIT Jalandhar is scheduled for this upcoming weekend. We look forward to your active participation and high-caliber parliamentary debate.",
    "",
    "====================================",
    "EVENT DETAILS",
    "====================================",
    "Date: Saturday, 18th October 2026",
    "Venue: Video Conferencing Hall (VCH), NIT Jalandhar",
    "Location Map: https://maps.app.goo.gl/VZDd27oNSfCB6jHGA",
    "Reporting Time: 7:00 AM",
    "",
    "====================================",
    "YOUR ALLOTTED PORTFOLIO",
    "====================================",
    "Portfolio: " + portfolioDisplay,
    "Status: Locked and Finalised",
    "Note: This portfolio assignment is locked and finalised. No changes or reallocations can be accommodated.",
    "",
    "====================================",
    "BEFORE YOU ARRIVE",
    "====================================",
    "1. Review the background guide and familiarise yourself with your portfolio's policy positions, past parliamentary interventions, and legislative record.",
    "2. Prepare a concise opening statement (90 seconds recommended) outlining your stance on the agenda.",
    "3. Carry a valid college or government-issued identity card for on-site verification.",
    "4. Arrive at the venue by 7:00 AM sharp to complete registration and seating formalities before the session begins.",
    "",
    "====================================",
    "SCHEDULE & DELEGATE COMMUNITY",
    "====================================",
    "View Schedule: https://www.instagram.com/p/Dd9YKzgR6nv/",
    "Join YPM Connect (WhatsApp): https://chat.whatsapp.com/DntwTYWxgvaJIpjhpTQ577",
    "",
    "For any queries or clarifications, please write to us directly at: nitjmunsoc@gmail.com",
    "",
    "With warm regards,",
    "Secretariat",
    "MUNSoC",
    "Dr. B. R. Ambedkar National Institute of Technology, Jalandhar",
  ].join("\n");
}

/**
 * Generates the elegant HTML reminder email for the conference day.
 * Includes event logistics, the delegate's locked portfolio, schedule link,
 * and contact information. No emojis. Clean, professional design matching MUNSoC website font.
 */
function buildConferenceReminderHtml(
  firstName,
  fullName,
  committee,
  allottedPortfolio,
) {
  const side = getPortfolioSide(allottedPortfolio);
  const sideLabel =
    side === "Government"
      ? "Government (NDA Coalition)"
      : side === "Opposition"
        ? "Opposition (INDIA Bloc)"
        : "";

  const resolvedCommittee = committee || "Youth Parliament (AIPPM)";

  // Parse portfolio into Leader Name and Position/Designation
  let portfolioName = allottedPortfolio;
  let portfolioPosition = "";
  const parenMatch = String(allottedPortfolio || "").match(/^([^(]+?)\s*\((.+)\)\s*$/);
  if (parenMatch) {
    portfolioName = parenMatch[1].trim();
    portfolioPosition = parenMatch[2].trim();
  }

  return `
    <!--[if mso]>
    <style type="text/css">
      body, table, td, h1, h2, h3, p, span, a { font-family: Impact, Arial, sans-serif !important; }
    </style>
    <![endif]-->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; background-color: #ffffff;">

      <!-- Header -->
      <div style="background-color: #0a0a0a; padding: 38px 24px; text-align: center; border-bottom: 4px solid #0284c7;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto; border-collapse: collapse;">
          <tr>
            <td valign="middle" style="padding-right: 24px;">
              <img src="https://munsoc.opensourcenitj.com/munsoc-white-blue.svg" alt="MUNSoC" width="72" height="72" style="display: block; border-radius: 16px;" />
            </td>
            <td valign="middle" style="border-left: 2px solid rgba(255, 255, 255, 0.28); padding-left: 24px; text-align: left;">
              <div style="font-family: 'Anton', 'Archivo', 'Haettenschweiler', 'Impact', 'Arial Narrow', sans-serif; font-size: 36px; font-weight: 400; color: #ffffff; letter-spacing: 3px; line-height: 1; text-transform: uppercase; margin: 0;">YOUTH PARLIAMENT</div>
              <div style="font-family: 'Inter', Arial, sans-serif; font-size: 15px; font-weight: 600; color: #38bdf8; text-transform: uppercase; letter-spacing: 2.5px; line-height: 1; margin-top: 8px;">AIPPM 2026</div>
            </td>
          </tr>
        </table>
      </div>

      <!-- Body -->
      <div style="padding: 32px 28px;">

        <p style="font-size: 15px; line-height: 1.7; color: #334155; margin-top: 0;">
          Good Day <strong>${escapeHtml(fullName || firstName)}</strong>,
        </p>

        <p style="font-size: 15px; line-height: 1.7; color: #334155;">
          We hope this message finds you well. This is an official reminder that the <strong>Youth Parliament (AIPPM)</strong> hosted by MUNSoC, NIT Jalandhar is scheduled for this upcoming weekend. We look forward to your active participation and parliamentary debate.
        </p>

        <!-- Event Details Card -->
        <div style="margin: 28px 0; border: 1px solid #cbd5e1; border-radius: 10px; overflow: hidden;">
          <div style="background-color: #0a0a0a; padding: 12px 20px;">
            <span style="font-size: 12px; font-weight: 700; color: #e2e8f0; text-transform: uppercase; letter-spacing: 1.5px;">Event Details</span>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 14px 20px; font-weight: 600; color: #64748b; width: 140px; background-color: #f8fafc; border-right: 1px solid #e2e8f0;">Date</td>
              <td style="padding: 14px 20px; font-weight: 700; color: #0f172a; font-size: 15px;">Saturday, 18th October 2026</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 14px 20px; font-weight: 600; color: #64748b; background-color: #f8fafc; border-right: 1px solid #e2e8f0;">Venue</td>
              <td style="padding: 14px 20px; font-weight: 700; color: #0f172a;">
                Video Conferencing Hall (VCH), NIT Jalandhar
                <div style="margin-top: 5px;">
                  <a href="https://maps.app.goo.gl/VZDd27oNSfCB6jHGA" target="_blank" style="color: #0284c7; font-size: 12px; font-weight: 600; text-decoration: none; display: inline-block;">
                    View on Google Maps &rarr;
                  </a>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding: 14px 20px; font-weight: 600; color: #64748b; background-color: #f8fafc; border-right: 1px solid #e2e8f0;">Reporting Time</td>
              <td style="padding: 14px 20px; font-weight: 700; color: #0f172a; font-size: 15px;">7:00 AM</td>
            </tr>
          </table>
        </div>

        <!-- Portfolio Confirmation Card -->
        <div style="margin: 28px 0; border: 1px solid #bae6fd; border-radius: 10px; overflow: hidden; background-color: #f0f9ff;">
          <div style="padding: 24px 24px; text-align: center;">
            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #0284c7; letter-spacing: 1.5px; display: block; margin-bottom: 10px;">Your Allotted Portfolio</span>
            <span style="font-size: 24px; font-weight: 800; color: #0c4a6e; display: block; line-height: 1.2;">${escapeHtml(portfolioName)}</span>
            ${portfolioPosition ? `<span style="font-size: 14px; font-weight: 500; color: #64748b; display: block; margin-top: 6px; line-height: 1.4;">${escapeHtml(portfolioPosition)}</span>` : ""}
            ${sideLabel ? `<span style="font-size: 12px; font-weight: 600; color: #0369a1; display: inline-block; margin-top: 10px; background-color: #e0f2fe; padding: 4px 12px; border-radius: 999px;">${escapeHtml(sideLabel)}</span>` : ""}
          </div>
          <div style="background-color: #e0f2fe; padding: 11px 24px; border-top: 1px solid #bae6fd;">
            <p style="margin: 0; font-size: 12px; color: #0c4a6e; line-height: 1.5; text-align: center;">
              This portfolio assignment is locked and finalised. No changes or reallocations can be accommodated.
            </p>
          </div>
        </div>

        <!-- Preparation Pointers -->
        <h3 style="font-size: 15px; color: #0f172a; margin: 24px 0 12px 0; font-weight: 700;">Before You Arrive</h3>
        <ul style="font-size: 14px; line-height: 1.8; color: #475569; padding-left: 20px; margin: 0;">
          <li>Review the background guide and familiarise yourself with your portfolio's policy positions, past parliamentary interventions, and legislative record.</li>
          <li>Prepare a concise opening statement (90 seconds recommended) outlining your stance on the agenda.</li>
          <li>Carry a valid college or government-issued identity card for on-site verification.</li>
          <li>Arrive at the venue by <strong>7:00 AM sharp</strong> to complete registration and seating formalities before the session begins.</li>
        </ul>

        <!-- Schedule & Community Links (Side-by-Side Pill Buttons) -->
        <div style="margin: 32px 0 24px 0; text-align: center;">
          <p style="font-size: 14px; color: #334155; margin: 0 0 18px 0;">
            Please review the detailed schedule and join the official delegate coordination group:
          </p>
          <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto; border-collapse: separate;">
            <tr>
              <!-- Button 1: View Schedule -->
              <td align="center" valign="middle" style="padding: 6px 8px;">
                <a href="https://www.instagram.com/p/Dd9YKzgR6nv/" target="_blank" style="display: inline-block; background-color: #0a0a0a; color: #ffffff; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 700; text-decoration: none; padding: 13px 26px; border-radius: 999px; letter-spacing: 0.3px; white-space: nowrap;">
                  View Schedule
                </a>
              </td>
              <!-- Button 2: Join YPM Connect (WhatsApp) -->
              <td align="center" valign="middle" style="padding: 6px 8px;">
                <a href="https://chat.whatsapp.com/DntwTYWxgvaJIpjhpTQ577" target="_blank" style="display: inline-block; background-color: #25D366; color: #ffffff; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 700; text-decoration: none; padding: 12px 24px; border-radius: 999px; letter-spacing: 0.3px; white-space: nowrap; box-shadow: 0 4px 12px rgba(37, 211, 102, 0.28);">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff" style="vertical-align: middle; margin-right: 8px; display: inline-block;">
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.44 19.65L5.27 16.61L5.07 16.29C4.24 14.98 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.08 7.31C8.92 7.31 8.67 7.37 8.45 7.61C8.23 7.85 7.61 8.43 7.61 9.61C7.61 10.79 8.47 11.93 8.59 12.09C8.71 12.25 10.28 14.67 12.69 15.71C13.26 15.96 13.7 16.1 14.05 16.21C14.62 16.39 15.14 16.36 15.55 16.3C16.01 16.23 16.96 15.72 17.16 15.16C17.36 14.6 17.36 14.12 17.3 14.02C17.24 13.92 17.08 13.86 16.84 13.74C16.6 13.62 15.42 13.04 15.2 12.96C14.98 12.88 14.82 12.84 14.66 13.08C14.5 13.32 14.04 13.86 13.9 14.02C13.76 14.18 13.62 14.2 13.38 14.08C13.14 13.96 12.37 13.71 11.46 12.9C10.75 12.27 10.27 11.49 10.13 11.25C9.99 11.01 10.11 10.88 10.23 10.76C10.34 10.65 10.48 10.47 10.6 10.33C10.72 10.19 10.76 10.09 10.84 9.93C10.92 9.77 10.88 9.63 10.82 9.51C10.76 9.39 10.3 8.25 10.1 7.79C9.91 7.33 9.71 7.4 9.56 7.39C9.42 7.38 9.25 7.38 9.08 7.31Z"/>
                  </svg>
                  <span style="vertical-align: middle;">Join YPM Connect</span>
                </a>
              </td>
            </tr>
          </table>
          <p style="font-size: 11px; color: #94a3b8; margin: 12px 0 0 0;">
            Schedule: <a href="https://www.instagram.com/p/Dd9YKzgR6nv/" style="color: #64748b; text-decoration: underline;">Instagram Post</a> &bull; WhatsApp: <a href="https://chat.whatsapp.com/DntwTYWxgvaJIpjhpTQ577" style="color: #64748b; text-decoration: underline;">Chat Link</a>
          </p>
        </div>

        <!-- Contact Information -->
        <div style="margin: 28px 0 0 0; padding: 16px 20px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
          <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.6;">
            Should you have any questions, require clarifications regarding the agenda or logistics, or wish to communicate any concerns, please write to us at
            <a href="mailto:nitjmunsoc@gmail.com" style="color: #0284c7; font-weight: 600; text-decoration: none;">nitjmunsoc@gmail.com</a>
            and we will respond at the earliest.
          </p>
        </div>

      </div>

      <!-- Footer -->
      <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 28px;">
        <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.6;">
          With warm regards,<br/>
          <strong style="color: #0f172a; font-size: 14px;">Secretariat</strong><br/>
          <span style="color: #475569; font-weight: 600;">MUNSoC</span><br/>
          <span>Dr. B. R. Ambedkar National Institute of Technology, Jalandhar</span>
        </p>
      </div>

    </div>
  `;
}

/**
 * ==============================================================================
 * TEST FUNCTION: Send Conference Day Reminder Email to Karthik
 * ==============================================================================
 * Target: karthikkchaitanya1@gmail.com
 *
 * HOW TO RUN:
 * 1. From Apps Script Editor:
 *    - In the top function dropdown, select "testSendConferenceReminderEmail"
 *    - Click "▶ Run"
 *    - View logs in the Execution Log window (Ctrl + Enter)
 * 2. From Google Sheets UI:
 *    - Refresh sheet, click "🏛️ MUNSoC Platform > 🧪 Send Test Reminder to Karthik"
 */
function testSendConferenceReminderEmail() {
  const testRecipient = "karthikkchaitanya1@gmail.com";
  const testName = "Karthik Kanithi";
  const testCommittee = "Youth Parliament (AIPPM)";
  const testPortfolio = "Shashi Tharoor (MP, Thiruvananthapuram)";

  Logger.log("[MUNSoC Test] Starting reminder test send to: " + testRecipient);

  try {
    const firstName = testName.split(/\s+/)[0] || testName;
    const subject =
      "Conference Day Reminder: Youth Parliament (AIPPM) — 18th October | MUNSoC NITJ";

    // Parse portfolio for HTML & plain-text generation
    let portfolioName = testPortfolio;
    let portfolioPosition = "";
    const parenMatch = String(testPortfolio || "").match(/^([^(]+?)\s*\((.+)\)\s*$/);
    if (parenMatch) {
      portfolioName = parenMatch[1].trim();
      portfolioPosition = parenMatch[2].trim();
    }
    const side = getPortfolioSide(testPortfolio);
    const sideLabel =
      side === "Government"
        ? "Government (NDA Coalition)"
        : side === "Opposition"
          ? "Opposition (INDIA Bloc)"
          : "";

    const htmlBody = buildConferenceReminderHtml(
      firstName,
      testName,
      testCommittee,
      testPortfolio,
    );

    // High-deliverability anti-spam plain text alternative
    const plainTextBody = buildConferenceReminderPlainText(
      testName,
      portfolioName,
      portfolioPosition,
      sideLabel,
    );

    sendEmailSafely(testRecipient, subject, htmlBody, plainTextBody);

    // Progress output requirement: <name sent> "x/total"
    const progressMessage = testName + " sent 1/1";
    Logger.log("[MUNSoC] " + progressMessage);

    // Real-time spreadsheet UI toast notification
    try {
      const ss = getSpreadsheet();
      if (ss) {
        ss.toast(progressMessage + " (Test)", "MUNSoC Test Reminders", 5);
      }
    } catch (tErr) {}

    safeAlert(
      "Test Email Dispatched",
      "Successfully sent conference reminder test email!\n\n" +
        "• Recipient: " + testName + " <" + testRecipient + ">\n" +
        "• Allotted Portfolio: " + testPortfolio + "\n" +
        "• Progress Output: " + progressMessage + "\n\n" +
        "Please check your inbox (and spam/promotions folder if it's the first time sending)."
    );

    return {
      status: "success",
      recipient: testRecipient,
      output: progressMessage,
    };
  } catch (err) {
    Logger.log("[MUNSoC Test] Error sending test email: " + err.toString());
    safeAlert("Test Dispatch Failed", "Error sending test email:\n" + err.message);
    throw err;
  }
}
