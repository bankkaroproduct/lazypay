/**
 * Card data source for the redesigned "Ledger" experience.
 *
 * Uses BankKaro's public, keyless endpoint. When the partner API key is set,
 * point CARDS_URL at the authenticated proxy route — the normalized shape
 * below is all the UI depends on, so nothing downstream changes.
 */

const CARDS_URL =
  process.env.PUBLIC_CARDS_URL ||
  "https://bk-prod-external.bankkaro.com/sp/api/cards";

export interface CardTag {
  id: number;
  name: string;
  seo_alias: string;
}

export interface CardUsp {
  header: string;
  description: string;
  priority: number;
}

/** Spend categories the reward engine understands. */
export type SpendCat =
  | "amazon" | "flipkart" | "online" | "shopping" | "grocery"
  | "dining" | "food" | "fuel" | "travel" | "bills" | "upi";

/** The normalized card every screen renders. */
export interface Card {
  id: number;
  name: string;
  bank: string;
  alias: string;
  networks: string[];
  image: string;
  gradient: string;
  rating: number;
  ratingCount: number;
  priority: number;
  joiningFee: number | null;   // base ₹ (pre-GST); null = not disclosed, 0 = free
  annualFee: number | null;
  annualFeeGst: number;        // GST-inclusive ₹, 0 if free
  annualSaving: number;
  minIncome: string;           // e.g. "3 LPA"
  incomeLPA: number;           // numeric, 0 if unknown
  minScore: string;
  scoreMin: number;
  applyUrl: string;
  tags: CardTag[];
  usps: CardUsp[];
  /** Parsed reward rates by category, e.g. { dining: 0.05, online: 0.05 }. */
  rates: Partial<Record<SpendCat, number>>;
  /** Full-fidelity object for the existing Compare panel / redirect handler / detail. */
  raw: any;
}

const num = (v: unknown): number | null => {
  if (v == null || v === "") return null;
  const n = parseInt(String(v).replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) ? n : null;
};

const flt = (v: unknown): number => {
  const n = parseFloat(String(v ?? "").trim());
  return Number.isFinite(n) ? n : 0;
};

const gstNum = (v: unknown): number => {
  const b = num(v);
  return !b ? 0 : Math.round(b * 1.18);
};

const bankFromName = (name: string): string => {
  const known = [
    "HDFC", "SBI", "ICICI", "Axis", "Kotak", "IDFC FIRST", "IDFC", "RBL", "AU",
    "IndusInd", "Yes", "HSBC", "American Express", "Amex", "Standard Chartered",
    "Federal", "BOB", "Tata Neu", "Jupiter", "Kiwi", "Scapia", "OneCard",
    "Slice", "Flipkart", "Airtel", "IndianOil", "BPCL", "IRCTC",
  ];
  const hit = known.find((k) => name.toLowerCase().includes(k.toLowerCase()));
  return hit || name.split(" ")[0] || "Card";
};

/** Category keyword map for parsing reward rates out of USP headers. */
const CAT_KW: Record<string, string[]> = {
  amazon: ["amazon"],
  flipkart: ["flipkart"],
  dining: ["dining", "restaurant", "dine"],
  food: ["swiggy", "zomato", "food"],
  grocery: ["grocery", "groceries", "bigbasket", "blinkit"],
  fuel: ["fuel", "petrol"],
  travel: ["travel", "flight", "hotel", "airline", "miles", "lounge"],
  bills: ["bill", "utility", "electricity", "recharge"],
  online: ["online"],
  shopping: ["shopping", "myntra", "ajio", "nykaa"],
  upi: ["upi"],
};

/** Parse per-category reward rates from a card's USP headers (honest heuristic). */
function parseRates(usps: any[]): Partial<Record<SpendCat, number>> {
  const r: Partial<Record<SpendCat, number>> = {};
  for (const u of usps || []) {
    const t = String(u?.header || "").toLowerCase();
    const pcts = [...t.matchAll(/(\d+(?:\.\d+)?)\s*%/g)].map((m) => parseFloat(m[1]));
    if (!pcts.length) continue;
    const rate = Math.min(Math.max(...pcts), 15) / 100;
    for (const [cat, kws] of Object.entries(CAT_KW)) {
      if (kws.some((k) => t.includes(k))) {
        r[cat as SpendCat] = Math.max(r[cat as SpendCat] ?? 0, rate);
      }
    }
  }
  return r;
}

function normalize(raw: any): Card {
  const networks = String(raw.card_type || "")
    .split(",")
    .map((s: string) => s.trim())
    .filter(Boolean)
    .map((n: string) => (n === "AmericanExpress" ? "Amex" : n));

  const name = raw.name || raw.card_name || "Credit Card";
  const bank = bankFromName(raw.name || "");
  const alias = raw.seo_card_alias || raw.card_alias || String(raw.id);
  const uspsRaw = [...(raw.product_usps || [])].sort(
    (a: any, b: any) => (a.priority ?? 99) - (b.priority ?? 99)
  );
  const incomeLPA = flt(raw.income_salaried);

  return {
    id: raw.id,
    name,
    bank,
    alias,
    networks: networks.length ? networks : ["Card"],
    image: raw.image || raw.card_bg_image || "",
    gradient:
      raw.card_bg_gradient ||
      "radial-gradient(120% 120% at 50% 0%, #2a2a33 0%, #0d0d10 100%)",
    rating: Number(raw.rating) || 0,
    ratingCount: Number(raw.user_rating_count) || 0,
    priority: num(raw.priority) ?? 9999,
    joiningFee: num(raw.joining_fee_text),
    annualFee: num(raw.annual_fee_text),
    annualFeeGst: gstNum(raw.annual_fee_text),
    annualSaving: num(raw.annual_saving) ?? 0,
    minIncome: incomeLPA > 0 ? `${raw.income_salaried} LPA` : "—",
    incomeLPA,
    minScore: raw.crif ? String(raw.crif) : "—",
    scoreMin: num(raw.crif) ?? 0,
    applyUrl: raw.network_url || raw.ck_store_url || raw.card_apply_link || "#",
    tags: (raw.tags || []).map((t: any) => ({
      id: t.id,
      name: t.name,
      seo_alias: t.seo_alias,
    })),
    usps: uspsRaw.map((u: any) => ({
      header: u.header || "",
      description: u.description || "",
      priority: Number(u.priority) || 99,
    })),
    rates: parseRates(uspsRaw),
    raw: {
      id: raw.id,
      name,
      card_name: name,
      seo_card_alias: alias,
      card_alias: alias,
      card_type: raw.card_type || networks.join(","),
      image: raw.image || raw.card_bg_image || "",
      card_bg_image: raw.card_bg_image || raw.image || "",
      joining_fee_text: raw.joining_fee_text ?? "",
      annual_fee_text: raw.annual_fee_text ?? "",
      network_url: raw.network_url || raw.ck_store_url || raw.card_apply_link || "",
      banks: { name: bank },
      rating: raw.rating,
    },
  };
}

// 10MB+ payload — exceeds Next's 2MB fetch data-cache limit, so we can't use
// `next: { revalidate }`. Every route (/, /cards, /cards/[alias], /card-genius,
// /card-genius-category, /beat-my-card) calls getCards() on its own, so without
// this cache each navigation re-fetched the full payload from scratch — that
// multi-second, feedback-less wait is what made buttons feel like they needed
// several clicks. Cache the normalized result in memory for a short TTL instead.
const CACHE_TTL_MS = 5 * 60 * 1000;
let cache: { data: Card[]; ts: number } | null = null;
let inflight: Promise<Card[]> | null = null;

async function fetchCards(): Promise<Card[]> {
  const res = await fetch(CARDS_URL, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Card API ${res.status}`);
  const json = await res.json();
  const data: any[] = Array.isArray(json?.data) ? json.data : [];
  return data
    .map(normalize)
    .filter((c) => c.name)
    .sort((a, b) => a.priority - b.priority);
}

export async function getCards(): Promise<Card[]> {
  if (cache && Date.now() - cache.ts < CACHE_TTL_MS) return cache.data;
  if (inflight) return inflight;
  inflight = fetchCards()
    .then((data) => {
      cache = { data, ts: Date.now() };
      return data;
    })
    .catch((err) => {
      console.error("[publicCards] fetch failed:", err);
      return cache?.data ?? [];
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}
