export function config() {
  const origin = new URL(process.env.POMHUB_ORIGIN ?? "http://localhost:3002").origin;
  const zikOrigin = new URL(process.env.ZIK_ORIGIN ?? "http://localhost:3000").origin;
  const clientSecret = process.env.ZIK_CLIENT_SECRET;
  const sessionSecret = process.env.POMHUB_SESSION_SECRET;
  if (!clientSecret || !sessionSecret || sessionSecret.length < 32) throw new Error("Configure PomHub's server secrets in .env.local.");
  if (process.env.NODE_ENV === "production" && (!origin.startsWith("https:") || !zikOrigin.startsWith("https:"))) throw new Error("Production requires HTTPS origins.");
  return { origin, zikOrigin, clientId: "pomhub", redirectUri: `${origin}/api/zik/callback`, clientSecret, sessionSecret };
}

/** Public rendering must remain available before the integration is configured. */
export function presentationConfig(): { zikUrl?: string; verificationAvailable: boolean } {
  try {
    const settings = config();
    return { zikUrl: `${settings.zikOrigin}/home`, verificationAvailable: true };
  } catch {
    return { verificationAvailable: false };
  }
}
