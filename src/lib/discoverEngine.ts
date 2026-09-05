/**
 * Shared reward engine for Card Genius, Category Card Genius and Beat My Card.
 *
 * Every rupee figure it produces is tied to a spend the user actually entered.
 * When the partner `/calculate` endpoint is available, swap `estimate` for a
 * call to it — the screens only depend on the { reward, net } shape.
 */

import type { Card, SpendCat } from "./publicCards";

/** [key, label, sliderMax, sliderDefault] — the Card Genius / Beat spend sliders. */
export const SPEND_SLIDERS: Array<[string, string, number, number]> = [
  ["amazon", "Amazon", 40000, 8000],
  ["flipkart", "Flipkart", 40000, 5000],
  ["other", "Other online", 60000, 8000],
  ["grocery", "Groceries", 40000, 8000],
  ["dining", "Dining out", 30000, 5000],
  ["food", "Food delivery", 20000, 4000],
  ["fuel", "Fuel", 20000, 4000],
  ["travel", "Travel (monthly avg)", 40000, 3000],
  ["bills", "Bills & utilities", 30000, 5000],
];

export type Spends = Record<string, number>;

export const defaultSpends = (): Spends =>
  Object.fromEntries(SPEND_SLIDERS.map(([k, , , def]) => [k, def]));

/** How a slider key maps onto a card's parsed reward categories, best-first. */
const SLIDER_TO_CATS: Record<string, SpendCat[]> = {
  amazon: ["amazon", "online", "shopping"],
  flipkart: ["flipkart", "online", "shopping"],
  other: ["online", "shopping"],
  grocery: ["grocery"],
  dining: ["dining"],
  food: ["food", "dining"],
  fuel: ["fuel"],
  travel: ["travel"],
  bills: ["bills"],
};

const BASE_RATE = 0.01;

export function rateFor(card: Card, sliderKey: string): number {
  const r = card.rates || {};
  for (const cat of SLIDER_TO_CATS[sliderKey] || []) {
    if (r[cat]) return r[cat]!;
  }
  return BASE_RATE;
}

/** Annual reward and net (reward − GST annual fee) for a given spend profile. */
export function estimate(card: Card, spends: Spends): { reward: number; net: number } {
  let reward = 0;
  for (const [k] of SPEND_SLIDERS) reward += (spends[k] || 0) * 12 * rateFor(card, k);
  return { reward, net: reward - (card.annualFeeGst || 0) };
}

const CAT_LABEL: Record<string, string> = {
  amazon: "Amazon", flipkart: "Flipkart", online: "Online", shopping: "Shopping",
  grocery: "Grocery", dining: "Dining", food: "Food", fuel: "Fuel",
  travel: "Travel", bills: "Bills", upi: "UPI",
};

/** The card's single strongest reward, shown where spends are unknown. */
export function topReward(card: Card): { pct: string; cat: string } {
  const r = card.rates || {};
  let best: string | null = null;
  for (const k in r) if (best === null || (r as any)[k] > (r as any)[best]) best = k;
  return best
    ? { pct: `${Math.round((r as any)[best] * 100)}%`, cat: CAT_LABEL[best] || best }
    : { pct: "", cat: "General rewards" };
}

/* ── Category Card Genius ─────────────────────────────────────────────── */

/** [key, label, defaultMonthlySpend] for the category chips. */
export const CATEGORIES: Array<[string, string, number]> = [
  ["amazon", "Amazon", 8000],
  ["flipkart", "Flipkart", 6000],
  ["online", "Online shopping", 10000],
  ["grocery", "Groceries", 8000],
  ["dining", "Dining", 6000],
  ["food", "Food delivery", 5000],
  ["fuel", "Fuel", 5000],
  ["travel", "Travel", 8000],
  ["bills", "Bills & utilities", 6000],
  ["upi", "UPI", 10000],
];

const CAT_FALLBACK: Record<string, SpendCat[]> = {
  amazon: ["amazon", "online", "shopping"],
  flipkart: ["flipkart", "online", "shopping"],
  online: ["online", "shopping"],
  grocery: ["grocery"],
  dining: ["dining"],
  food: ["food", "dining"],
  fuel: ["fuel"],
  travel: ["travel"],
  bills: ["bills"],
  upi: ["upi", "online"],
};

export function catRate(card: Card, category: string): number {
  const r = card.rates || {};
  for (const k of CAT_FALLBACK[category] || [category as SpendCat]) {
    if (r[k as SpendCat]) return r[k as SpendCat]!;
  }
  return BASE_RATE;
}

export const rupee = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
