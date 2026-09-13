import { NextRequest, NextResponse } from "next/server";
import { config } from "@/lib/config";
import { STATE_COOKIE, SESSION_COOKIE, cookieOptions, createSession } from "@/lib/session";
import { exchangeCode } from "@/lib/zik";
export async function GET(request: NextRequest) {
  let origin: string;
  try { origin = config().origin; } catch {
    return NextResponse.json({ error: "Verification is temporarily unavailable." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  let response: NextResponse;
  try {
    const code = request.nextUrl.searchParams.get("code");
    const state = request.nextUrl.searchParams.get("state");
    const expected = request.cookies.get(STATE_COOKIE)?.value;
    if (!code || !state || !expected || state !== expected || code.length > 512 || state.length > 512 || request.nextUrl.searchParams.has("error")) throw new Error("Invalid callback");
    const session = createSession(await exchangeCode(code, state));
    response = NextResponse.redirect(new URL("/", origin), 303);
    response.cookies.set(SESSION_COOKIE, session.token, { ...cookieOptions, expires: new Date(session.expiresAt) });
  } catch {
    response = NextResponse.redirect(new URL("/?verification=denied", origin), 303);
  }
  response.cookies.set(STATE_COOKIE, "", { ...cookieOptions, maxAge: 0 });
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
