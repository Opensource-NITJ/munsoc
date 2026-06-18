import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: "Form submissions are currently disabled.",
    });
  } catch (err) {
    console.error("[MUNSoC] Unexpected error:", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
