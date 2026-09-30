/**
 * Card data source for the redesigned "Ledger" experience (server-only).
 *
 * Primary: the partner cards API (PARTNER_BASE_URL/cardgenius/cards) with the
 * partner token — its apply links carry lazypay's own campaign ids and the
 * p1={click_id} / p2={user_id} slots. Fallback: BankKaro's public, keyless feed
 * (generic campaigns) so the site still renders if the partner API is down.
 * Both return the same raw shape, so normalize() below serves either.
 */

const PUBLIC_CARDS_URL =
  process.env.PUBLIC_CARDS_URL ||
  "https://bk-prod-external.bankkaro.com/sp/api/cards";
const PARTNER_BASE_URL = process.env.PARTNER_BASE_URL || "https://platform.bankkaro.com/partner";
const PARTNER_TOKEN_URL = process.env.PARTNER_TOKEN_URL || "https://platform.bankkaro.com/partner/token";

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
  /** Fixed-Deposit backed (secured) card — approval without a credit score. */
  isFD: boolean;
  /** Minimum FD in ₹, parsed from the card's own copy; null = not published. */
  minFD: number | null;
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

/** Curated FD cards whose own copy doesn't say "FD-backed". */
const FD_ALIASES = new Set([
  "idfc-first-wow-credit-card",
  "idfc-first-wow-black-credit-card",
  "sbi-unnati-credit-card",
  "jupiter-edge-credit-card",
  "yes-prosperity-reward-plus-credit-card",
  "paizabazaar-step-up-sbm-credit-card",
  "equitas-selfe-credit-card",
]);
/** Cards that only offer an optional FD-backed variant — not secured by default. */
const FD_EXCLUDE = new Set(["hdfc-pixel-go-credit-card"]);
const FD_TEXT = /fd[- ]backed|fixed deposit|secured (credit )?card|against (an |your )?fd|\bfd of\b/i;

/**
 * The API has no "secured" flag, so detect FD cards from the card's own copy
 * (name, meta, eligibility comments, USPs). Blogs/FAQs are skipped on purpose —
 * they mention *other* cards and cause false positives.
 */
function detectFD(raw: any, alias: string): boolean {
  if (FD_EXCLUDE.has(alias)) return false;
  if (FD_ALIASES.has(alias)) return true;
  const own = [
    raw.name, raw.meta_title, raw.meta_description,
    raw.income_comment, raw.income_self_emp_comment, raw.crif_comment,
    ...(raw.product_usps || []).map((u: any) => `${u?.header ?? ""} ${u?.description ?? ""}`),
  ].join(" ");
  return FD_TEXT.test(own);
}

const rupees = (v: string) => parseInt(v.replace(/,/g, ""), 10);
const AMT = String.raw`(?:rs\.?\s?|₹\s?|inr\s?)([\d,]{3,})`;
const MIN_FD_RE = [
  new RegExp(String.raw`minimum (?:fd|fixed deposit) amount (?:required )?(?:is )?(?:of )?` + AMT, "i"),
  new RegExp(String.raw`(?:fd|fixed deposit|deposit) of (?:just |only |at least |minimum |min\.? )?` + AMT, "i"),
];

/**
 * Minimum FD isn't a field in the feed. Read it from the card's own USPs, T&C,
 * meta and eligibility copy, then from its FAQ that asks about the minimum FD.
 * Fee-waiver copy is skipped on purpose ("FD of ₹5,000 or above waives the fee").
 */
function parseMinFD(raw: any): number | null {
  const own = [
    ...(raw.product_usps || []).map((u: any) => `${u?.header ?? ""} ${u?.description ?? ""}`),
    raw.tnc, raw.meta_description, raw.income_comment, raw.income_self_emp_comment,
  ].map((x) => String(x ?? "")).join(" \n ");
  for (const re of MIN_FD_RE) {
    const m = own.match(re);
    if (m) return rupees(m[1]);
  }
  for (const b of raw.product_blogs || []) {
    for (const f of Array.isArray(b?.faqs) ? b.faqs : []) {
      if (!/minimum (?:fd|fixed deposit)/i.test(f?.question || "")) continue;
      const m = String(f?.answer || "").match(new RegExp(AMT, "i"));
      if (m) return rupees(m[1]);
    }
  }
  return null;
}

/* ── full details (detail page only — kept off Card so list payloads stay small) ── */

export interface CardFaq { q: string; a: string }
export interface CardDetails {
  joiningFeeNote: string[];
  annualFeeNote: string[];
  rewardRate: string;
  redemption: string[];
  catalogueUrl: string;
  eligibility: { label: string; value: string }[];
  exclusions: string[];
  tnc: string;
  faqs: { topic: string; items: CardFaq[] }[];
}

const JUNK = new Set(["", "0", "-", "na", "n/a", "nil", "none", "null", "undefined", "not applicable"]);
const stripHtml = (v: unknown) =>
  String(v ?? "").replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
const clean = (v: unknown) => {
  const t = stripHtml(v);
  return JUNK.has(t.toLowerCase().replace(/\.$/, "")) ? "" : t;
};
const htmlList = (v: unknown): string[] => {
  const html = String(v ?? "");
  const items = [...html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((m) => clean(m[1])).filter(Boolean);
  return items.length ? items : [clean(html)].filter(Boolean);
};
const httpsUrl = (v: unknown) => (/^https:\/\//i.test(String(v ?? "").trim()) ? String(v).trim() : "");

const FAQ_TOPICS: Record<string, string> = {
  best_for: "Who it's for",
  eligibility: "Eligibility",
  document_required: "Documents",
  how_to_apply: "How to apply",
  credit_limit_and_expect: "Credit limit",
  all_benefits: "Benefits",
  joining_annual_fee: "Joining & annual fee",
  bank_fee_structure: "Charges",
  redemption: "Rewards & redemption",
  bank_exclusions: "Exclusions",
};
const EMPLOYMENT: Record<string, string> = { both: "Salaried & self-employed", salaried: "Salaried", self_employed: "Self-employed" };

function extractDetails(raw: any): CardDetails {
  const seen = new Set<string>();
  const faqs = Object.entries(FAQ_TOPICS).map(([key, topic]) => {
    const blogs = (raw.product_blogs || []).filter((b: any) => String(b?.blog_type || "").toLowerCase() === key);
    const items: CardFaq[] = [];
    for (const b of blogs) {
      for (const f of Array.isArray(b?.faqs) ? b.faqs : []) {
        const q = clean(f?.question).replace(/^q\.\s*/i, "");
        const a = clean(f?.answer).replace(/^a\.\s*/i, "");
        if (!q || !a || seen.has(q.toLowerCase())) continue;
        seen.add(q.toLowerCase());
        items.push({ q, a });
      }
    }
    return { topic, items };
  }).filter((g) => g.items.length);

  const age = clean(raw.age_criteria_comment) || (clean(raw.age_criteria) ? `${clean(raw.age_criteria)} years` : "");
  const eligibility = [
    { label: "Age", value: age },
    { label: "Employment", value: EMPLOYMENT[String(raw.employment_type || "").toLowerCase()] || clean(raw.employment_type) },
    { label: "Income", value: clean(raw.income_comment) },
    { label: "Credit score", value: clean(raw.crif_comment) },
    { label: "New to credit", value: raw.new_to_credit === true ? "Yes — no credit history needed" : "" },
  ].filter((e) => e.value);

  const exclusions = [...new Set(
    [raw.exclusion_earnings, raw.exclusion_spends]
      .flatMap((v) => clean(v).replace(/;/g, "").split(","))
      .map((x) => x.trim()).filter(Boolean)
  )];

  return {
    joiningFeeNote: [clean(raw.joining_fee_offset), clean(raw.joining_fee_comment)].filter(Boolean),
    annualFeeNote: [clean(raw.annual_fee_waiver), clean(raw.annual_fee_comment)].filter(Boolean),
    rewardRate: clean(raw.reward_conversion_rate),
    redemption: htmlList(raw.redemption_options),
    catalogueUrl: httpsUrl(raw.redemption_catalogue),
    eligibility,
    exclusions,
    tnc: clean(raw.tnc),
    faqs,
  };
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
    isFD: detectFD(raw, alias),
    minFD: parseMinFD(raw),
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
type Catalog = { cards: Card[]; details: Map<string, CardDetails> };
let cache: { data: Catalog; ts: number } | null = null;
let inflight: Promise<Catalog> | null = null;

async function fetchPartnerRaw(): Promise<any[]> {
  const apiKey = process.env.PARTNER_API_KEY?.trim();
  if (!apiKey) throw new Error("PARTNER_API_KEY not set");
  const tokenRes = await fetch(PARTNER_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ "x-api-key": apiKey }),
    cache: "no-store",
  });
  const token = (await tokenRes.json().catch(() => null))?.data?.jwttoken;
  if (!token) throw new Error(`Partner token ${tokenRes.status}`);

  const res = await fetch(`${PARTNER_BASE_URL}/cardgenius/cards`, {
    headers: { "Content-Type": "application/json", "partner-token": token },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Partner cards API ${res.status}`);
  const json = await res.json();
  if (!Array.isArray(json?.data) || !json.data.length) throw new Error("Partner cards API returned no cards");
  return json.data;
}

async function fetchPublicRaw(): Promise<any[]> {
  const res = await fetch(PUBLIC_CARDS_URL, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Card API ${res.status}`);
  const json = await res.json();
  return Array.isArray(json?.data) ? json.data : [];
}

async function fetchCatalog(): Promise<Catalog> {
  const [partner, pub] = await Promise.allSettled([fetchPartnerRaw(), fetchPublicRaw()]);
  let data: any[];
  if (partner.status === "fulfilled") {
    data = partner.value;
    // The partner API has no product_blogs (FAQs, some min-FD answers) — take them from the public feed.
    if (pub.status === "fulfilled") {
      const blogs = new Map(pub.value.map((r: any) => [r.seo_card_alias || r.card_alias, r.product_blogs]));
      data = data.map((r: any) => (r.product_blogs ? r : { ...r, product_blogs: blogs.get(r.seo_card_alias || r.card_alias) }));
    }
  } else {
    console.error("[publicCards] partner cards API failed, using public feed:", partner.reason);
    if (pub.status === "rejected") throw pub.reason;
    data = pub.value;
  }
  const details = new Map<string, CardDetails>();
  const cards = data
    .map((raw) => {
      const card = normalize(raw);
      details.set(card.alias, extractDetails(raw));
      return card;
    })
    .filter((c) => c.name)
    .sort((a, b) => a.priority - b.priority);
  return { cards, details };
}

async function getCatalog(): Promise<Catalog> {
  if (cache && Date.now() - cache.ts < CACHE_TTL_MS) return cache.data;
  if (inflight) return inflight;
  inflight = fetchCatalog()
    .then((data) => {
      cache = { data, ts: Date.now() };
      return data;
    })
    .catch((err) => {
      console.error("[publicCards] fetch failed:", err);
      return cache?.data ?? { cards: [], details: new Map() };
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export async function getCards(): Promise<Card[]> {
  return (await getCatalog()).cards;
}

export async function getCardDetails(alias: string): Promise<CardDetails | null> {
  return (await getCatalog()).details.get(alias) ?? null;
}
