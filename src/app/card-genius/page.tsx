import type { Metadata } from "next";
import { getCards } from "@/lib/publicCards";
import { brandConfig } from "@/config/brand.config";
import CardGeniusView from "@/components/discover/CardGeniusView";

export const metadata: Metadata = {
  title: `${brandConfig.name} — Card Genius`,
};

export default async function CardGeniusPage() {
  const cards = await getCards();
  return <CardGeniusView cards={cards} />;
}
