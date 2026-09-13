import { NextRequest, NextResponse } from "next/server";
import { config } from "@/lib/config";
import { SESSION_COOKIE, STATE_COOKIE, cookieOptions } from "@/lib/session";

export async function POST(request: NextRequest) {
  let origin: string;
  try { origin = config().origin; } catch {
    return NextResponse.json({ error: "Reset is temporarily unavailable." }, { status: 503 });
  }
  if (request.headers.get("origin") !== origin) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  const response = NextResponse.redirect(new URL("/", origin), 303);
  for (const name of [SESSION_COOKIE, STATE_COOKIE]) {
    response.cookies.set(name, "", { ...cookieOptions, maxAge: 0 });
  }
  response.headers.set("Cache-Control", "no-store");
  return response;
}
