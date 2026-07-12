import { NextRequest, NextResponse } from "next/server";

const REF_TRACKING_WEBHOOK_URL = process.env.REF_TRACKING_WEBHOOK_URL || "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!REF_TRACKING_WEBHOOK_URL) {
      console.warn("[MUNSoC Track] REF_TRACKING_WEBHOOK_URL is not set.");
      return NextResponse.json({ success: true, mode: "demo" });
    }

    const response = await fetch(REF_TRACKING_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (result.result === "success") {
      return NextResponse.json({ success: true });
    } else {
      console.error("[MUNSoC Track] Google script error:", result.error);
      return NextResponse.json(
        { success: false, error: "Failed to write to sheet" },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("[MUNSoC Track] Error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
