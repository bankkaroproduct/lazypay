/**
 * Real savings via BankKaro's authenticated /cardgenius/calculate engine.
 *
 * This replaces the client-side estimate: given the user's monthly spends,
 * it returns the OFFICIAL yearly savings per card (same numbers the partner
 * platform computes). Called from the browser through the app's auth proxy.
 */

import { cardService, type SpendingData } from "@/services/cardService";

/** Slider keys used by Card Genius / Beat. */
export interface SpendInput {
  amazon?: number; flipkart?: number; other?: number; grocery?: number;
  dining?: number; food?: number; fuel?: number; travel?: number; bills?: number;
}

export interface SavingRow {
  id: number;
  name: string;
  alias: string;
  image: string;
  gradient: string;
  annualFeeText: string;
  savingsYearly: number;
  applyUrl: string;
  topUsp: string;
}

/** Map the 9 monthly sliders onto the platform's exact SpendingData schema. */
export function toSpendingData(s: SpendInput): SpendingData {
  const bills = s.bills || 0;
  return {
    amazon_spends: s.amazon || 0,
    flipkart_spends: s.flipkart || 0,
    other_online_spends: s.other || 0,
    other_offline_spends: 0,
    grocery_spends_online: s.grocery || 0,
    online_food_ordering: s.food || 0,
    fuel: s.fuel || 0,
    dining_or_going_out: s.dining || 0,
    flights_annual: 0,
    hotels_annual: (s.travel || 0) * 12,
    domestic_lounge_usage_quarterly: 0,
    international_lounge_usage_quarterly: 0,
    mobile_phone_bills: Math.round(bills / 2),
    electricity_bills: Math.round(bills / 2),
    water_bills: 0,
    insurance_car_or_bike_annual: 0,
    insurance_health_annual: 0,
    rent: 0,
    school_fees: 0,
    life_insurance: 0,
    offline_grocery: 0,
  };
}

/** For Category Card Genius: route one category's monthly spend to its field. */
export function categorySpendingData(category: string, monthly: number): SpendingData {
  const base = toSpendingData({});
  const map: Record<string, keyof SpendingData | ((v: number) => Partial<SpendingData>)> = {
    amazon: "amazon_spends",
    flipkart: "flipkart_spends",
    online: "other_online_spends",
    grocery: "grocery_spends_online",
    dining: "dining_or_going_out",
    food: "online_food_ordering",
    fuel: "fuel",
    travel: (v) => ({ hotels_annual: v * 12 }),
    bills: (v) => ({ mobile_phone_bills: Math.round(v / 2), electricity_bills: Math.round(v / 2) }),
    upi: "other_online_spends",
  };
  const m = map[category];
  if (typeof m === "function") return { ...base, ...m(monthly) };
  if (m) return { ...base, [m]: monthly } as SpendingData;
  return { ...base, other_online_spends: monthly };
}

function normalizeRows(items: any[]): SavingRow[] {
  return items
    .map((it: any): SavingRow => {
      const usps = it.product_usps || [];
      return {
        id: it.id ?? it.card_id,
        name: it.name || it.card_name || "Credit Card",
        alias: it.seo_card_alias || it.card_alias || String(it.id),
        image: it.image || it.card_bg_image || "",
        gradient: it.card_bg_gradient || "radial-gradient(120% 120% at 50% 0%, #2a2a33, #0d0d10)",
        annualFeeText: it.annual_fee_text ?? String(it.annual_fees ?? ""),
        savingsYearly: Math.round(Number(it.total_savings_yearly ?? it.total_savings ?? 0)),
        applyUrl: it.network_url || it.cg_network_url || it.ck_store_url || "#",
        topUsp: usps[0]?.header || "",
      };
    })
    .filter((r) => r.name)
    .sort((a, b) => b.savingsYearly - a.savingsYearly);
}

/** Full-profile savings (Card Genius, Beat My Card). */
export async function calcSavings(spends: SpendInput): Promise<SavingRow[]> {
  const resp = await cardService.calculateCardGenius(toSpendingData(spends));
  const items: any[] = resp?.data?.savings ?? (Array.isArray(resp?.data) ? resp.data : []);
  return normalizeRows(items);
}

/** Single-category savings (Category Card Genius). */
export async function calcCategorySavings(category: string, monthly: number): Promise<SavingRow[]> {
  const resp = await cardService.calculateCardGenius(categorySpendingData(category, monthly));
  const items: any[] = resp?.data?.savings ?? (Array.isArray(resp?.data) ? resp.data : []);
  return normalizeRows(items);
}
