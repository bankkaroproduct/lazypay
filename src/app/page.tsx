import type { Metadata } from "next";
import FDFlow from "@/components/discover/FDFlow";
import { getCards } from "@/lib/publicCards";
import { brandConfig } from "@/config/brand.config";

export const metadata: Metadata = {
  title: `${brandConfig.name} — Credit cards on your Fixed Deposit`,
  description: `${brandConfig.name} — get a credit card backed by your FD. No credit score needed.`,
  robots: "index, follow",
  alternates: { canonical: process.env.NEXT_PUBLIC_APP_URL || "https://lazypay.bankkaro.com" },
};

// Current flow: lead capture → FD cards only. The full app home (AppShell) is
// parked until the rest of the journey is switched back on.
export default async function Home() {
  const cards = (await getCards()).filter((c) => c.isFD);
  return <FDFlow cards={cards} />;
}
