import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher:
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)",
};

export function proxy(req: NextRequest) {
  const { searchParams, pathname } = req.nextUrl;
  const ref = searchParams.get("ref");

  if (ref) {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const payload = {
      ref,
      url: pathname + req.nextUrl.search,
      ip,
      timestamp: new Date().toISOString(),
      user_agent: req.headers.get("user-agent") || "",
      referer: req.headers.get("referer") || "",
      accept_language: req.headers.get("accept-language") || "",
      country: req.headers.get("x-vercel-ip-country") || "",
      city: req.headers.get("x-vercel-ip-city") || "",
      region: req.headers.get("x-vercel-ip-country-region") || "",
    };

    const trackingUrl = new URL("/api/track", req.nextUrl.origin);
    fetch(trackingUrl.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch((err) => {
      console.error("[MUNSoC Proxy] Tracking fetch failed:", err);
    });
  }

  return NextResponse.next();
}
