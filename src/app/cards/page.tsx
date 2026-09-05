import type { Metadata } from "next";
import Ledger from "@/components/discover/Ledger";
import { getCards } from "@/lib/publicCards";
import { brandConfig } from "@/config/brand.config";

export const metadata: Metadata = {
  title: `${brandConfig.name} — India's credit cards, ranked`,
  description: "Every credit card in India, ranked by how much money it saves you.",
  robots: "index, follow",
};

export default async function CardsPage({
  searchParams,
}: {
  searchParams: Promise<{ lens?: string }>;
}) {
  const cards = await getCards();
  const { lens } = await searchParams;
  return <Ledger cards={cards} initialLens={lens} />;
}
