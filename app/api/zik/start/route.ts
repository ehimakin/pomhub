import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { config } from "@/lib/config";
import { STATE_COOKIE, cookieOptions } from "@/lib/session";
import { startVerification } from "@/lib/zik";
export async function POST(request: NextRequest) {
  try {
    if (request.headers.get("origin") !== config().origin) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    const state = randomBytes(32).toString("base64url");
    const confirm_url = await startVerification(state);
    const response = NextResponse.json({ confirm_url }, { headers: { "Cache-Control": "no-store" } });
    response.cookies.set(STATE_COOKIE, state, { ...cookieOptions, maxAge: 600 });
    return response;
  } catch { return NextResponse.json({ error: "Could not reach Zik. Please try again." }, { status: 503 }); }
}
