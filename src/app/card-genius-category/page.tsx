import type { Metadata } from "next";
import { getCards } from "@/lib/publicCards";
import { brandConfig } from "@/config/brand.config";
import CategoryGeniusView from "@/components/discover/CategoryGeniusView";

export const metadata: Metadata = {
  title: `${brandConfig.name} — Card Genius by Category`,
};

export default async function CardGeniusCategoryPage() {
  const cards = await getCards();
  return <CategoryGeniusView cards={cards} />;
}
