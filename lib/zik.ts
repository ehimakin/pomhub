import { config } from "./config";
async function zikPost(path: string, fields: Record<string, string>) {
  const c = config();
  const response = await fetch(`${c.zikOrigin}${path}`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${c.clientSecret}` }, body: JSON.stringify({ client_id: c.clientId, redirect_uri: c.redirectUri, ...fields }), cache: "no-store", redirect: "error", signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error("Zik verification unavailable");
  return response.json();
}
export async function startVerification(state: string) {
  const result = await zikPost("/api/affiliate/authorize", { state });
  if (typeof result.confirm_url !== "string") throw new Error("Invalid Zik response");
  const url = new URL(result.confirm_url, config().zikOrigin);
  if (url.origin !== config().zikOrigin || url.pathname !== "/affiliate-demo/confirm" || !url.searchParams.get("request_id")) throw new Error("Invalid approval URL");
  return url.href;
}
export async function exchangeCode(code: string, state: string): Promise<string> {
  const result = await zikPost("/api/affiliate/token", { code, state });
  if (result.age_over !== true || result.threshold !== 18 || typeof result.expires_at !== "string") throw new Error("Age not confirmed");
  return result.expires_at;
}
