import type { Metadata } from "next";
import AppShell from "@/components/discover/AppShell";
import { getCards } from "@/lib/publicCards";
import { brandConfig } from "@/config/brand.config";

export const metadata: Metadata = {
  title: `${brandConfig.name} — Smart payments & the best credit cards`,
  description: `${brandConfig.name} — pay smarter, then find the credit card that actually pays you back.`,
  robots: "index, follow",
  alternates: { canonical: process.env.NEXT_PUBLIC_APP_URL || "https://lazypay.com" },
};

export default async function Home() {
  const cards = await getCards();
  return <AppShell cards={cards} />;
}
