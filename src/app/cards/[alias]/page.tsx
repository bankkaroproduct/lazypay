import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCards, getCardDetails } from "@/lib/publicCards";
import { brandConfig } from "@/config/brand.config";
import CardDetailView from "@/components/discover/CardDetailView";

interface Props {
  params: Promise<{ alias: string }>;
  searchParams: Promise<{ from?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { alias } = await params;
  const cards = await getCards();
  const card = cards.find((c) => c.alias === alias);
  return {
    title: `${card?.name ?? "Card"} — ${brandConfig.name}`,
  };
}

export default async function CardDetailsPage({ params, searchParams }: Props) {
  const { alias } = await params;
  const { from } = await searchParams;
  const cards = await getCards();
  const card = cards.find((c) => c.alias === alias);
  if (!card) notFound();
  const details = await getCardDetails(alias);
  return <CardDetailView card={card} details={details} fd={from === "fd"} />;
}
