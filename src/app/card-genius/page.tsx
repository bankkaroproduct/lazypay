import type { Metadata } from "next";
import CardGenius from "@/views/CardGenius";

export const metadata: Metadata = {
  robots: 'noindex, follow',
  alternates: { canonical: 'https://great.cards/cg-360' },
};

export default function CardGeniusPage() {
  return <CardGenius />;
}
