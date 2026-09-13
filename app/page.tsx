import { cookies } from "next/headers";
import { PomHubSite } from "@/components/pomhub-site";
import { readSession, SESSION_COOKIE } from "@/lib/session";
import { presentationConfig } from "@/lib/config";
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const presentation = presentationConfig();
  const session = readSession((await cookies()).get(SESSION_COOKIE)?.value);
  const params = await searchParams;
  return <PomHubSite verifiedUntil={session?.expiresAt ?? null} denied={params.verification === "denied"} verificationAvailable={presentation.verificationAvailable} />;
}
