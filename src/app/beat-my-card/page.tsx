import type { Metadata } from "next";
import { getCards } from "@/lib/publicCards";
import { brandConfig } from "@/config/brand.config";
import { BeatMyCardView } from "@/components/discover/BeatMyCardView";

export const metadata: Metadata = {
  title: `${brandConfig.name} — Beat My Card`,
  robots: "noindex, follow",
};

export default async function BeatMyCardPage() {
  const cards = await getCards();
  return <BeatMyCardView cards={cards} />;
}
