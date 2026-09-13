import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { config } from "./config";
export const SESSION_COOKIE = "pomhub-age-session";
export const STATE_COOKIE = "pomhub-age-request";
export const TTL = 30 * 60 * 1000;
function sign(payload: string) { return createHmac("sha256", config().sessionSecret).update("pomhub:age:v1:" + payload).digest("base64url"); }
export function createSession(passExpiry: string, now = Date.now()) {
  const expiresAt = Math.min(Date.parse(passExpiry), now + TTL);
  if (!Number.isFinite(expiresAt) || expiresAt <= now) throw new Error("Expired verification");
  const payload = Buffer.from(JSON.stringify({ audience: "pomhub", over18: true, issuedAt: now, expiresAt, nonce: randomBytes(24).toString("base64url") })).toString("base64url");
  return { token: `${payload}.${sign(payload)}`, expiresAt };
}
export function readSession(token?: string, now = Date.now()): { expiresAt: number } | null {
  if (!token || token.length > 2048) return null;
  try {
    const parts = token.split("."); if (parts.length !== 2) return null;
    const [payload, signature] = parts;
    const actual = Buffer.from(signature), expected = Buffer.from(sign(payload));
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
    const s = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (s.audience !== "pomhub" || s.over18 !== true || !Number.isFinite(s.issuedAt) || !Number.isFinite(s.expiresAt) || s.issuedAt > now || s.expiresAt <= now || s.expiresAt <= s.issuedAt || s.expiresAt - s.issuedAt > TTL || typeof s.nonce !== "string") return null;
    return { expiresAt: s.expiresAt };
  } catch { return null; }
}
export const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" };
