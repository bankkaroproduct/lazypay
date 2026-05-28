"use client";
import { Search, Star, CreditCard, Users, TrendingUp, ArrowUpRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import AdvisorToolsGrid from "@/components/AdvisorToolsGrid";
import Footer from "@/components/Footer";
import { Link } from "@/components/Link";
import { authManager } from "@/services/authManager";

// ── Types ────────────────────────────────────────────────────────────────────
type CardItem = {
  name: string;
  bank: string;
  alias: string;
  image: string;
  joining_fee: string;
  annual_fee: string;
  networks: string;
};

type TabKey = "picks" | "best" | "beginner" | "cashback";

// ── Helpers ──────────────────────────────────────────────────────────────────
const BANK_MAP: Record<string, string> = {
  hdfc: "HDFC Bank",
  sbi: "SBI Card",
  axis: "Axis Bank",
  icici: "ICICI Bank",
  kotak: "Kotak Bank",
  idfc: "IDFC FIRST",
  hsbc: "HSBC",
  amex: "Amex",
  "american express": "Amex",
  scapia: "Federal Bank",
  kiwi: "Kiwi",
  indusind: "IndusInd Bank",
  yes: "Yes Bank",
  rbl: "RBL Bank",
  au: "AU Small Finance",
  bob: "Bank of Baroda",
  swiggy: "HDFC Bank",
  flipkart: "SBI Card",
  myntra: "Kotak Bank",
  tata: "SBI Card",
};

function extractBank(cardName: string): string {
  const lower = cardName.toLowerCase();
  for (const [key, val] of Object.entries(BANK_MAP)) {
    if (lower.includes(key)) return val;
  }
  return "Bank";
}


function parseRawCards(data: any): any[] {
  if (Array.isArray(data?.data?.cards)) return data.data.cards;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data)) return data;
  return [];
}

function formatFee(raw: any): string {
  const s = String(raw ?? "").trim();
  if (!s || s === "0" || s.toLowerCase() === "free") return "Free";
  return `₹${s}`;
}

function toCardItem(c: any): CardItem {
  const alias = c.seo_card_alias || c.card_alias || "";
  const name = c.name || c.card_name || "";
  const bank = c.bank_name || c.bank || extractBank(name);
  const image = c.card_bg_image || c.image || "";
  const joining_fee = formatFee(c.joining_fee_text ?? c.joining_fee);
  const annual_fee = formatFee(c.annual_fee_text ?? c.annual_fee);
  const networks = c.card_type || "";
  return { name, bank, alias, image, joining_fee, annual_fee, networks };
}

function curateCards(raw: any[], aliases: string[]): CardItem[] {
  const byAlias = new Map<string, any>();
  raw.forEach((c) => {
    const a = c.seo_card_alias || c.card_alias || "";
    if (a && !byAlias.has(a)) byAlias.set(a, c);
  });

  const result: CardItem[] = [];
  const used = new Set<string>();
  for (const alias of aliases) {
    if (byAlias.has(alias)) {
      result.push(toCardItem(byAlias.get(alias)));
      used.add(alias);
    }
  }

  // Fill remaining slots with API order if curated cards weren't found
  if (result.length < 9) {
    for (const c of raw) {
      if (result.length >= 9) break;
      const a = c.seo_card_alias || c.card_alias || "";
      if (!used.has(a)) {
        result.push(toCardItem(c));
        used.add(a);
      }
    }
  }

  return result.slice(0, 9);
}

// ── Stats ────────────────────────────────────────────────────────────────────
const STATS = [
  { value: "130+",  label: "Cards Listed",   icon: CreditCard },
  { value: "50K+",  label: "Users Helped",   icon: Users },
  { value: "₹12K",  label: "Avg. Savings/yr",icon: TrendingUp },
  { value: "4.9★",  label: "User Rating",    icon: Star },
];

// ── Card component ───────────────────────────────────────────────────────────
function CardTile({ card }: { card: CardItem }) {
  const networkList = card.networks
    ? card.networks.split(",").map((n) => n.trim()).filter(Boolean)
    : [];

  return (
    <div className="lp-card overflow-hidden flex flex-col group">
      {/* Image */}
      <div className="h-48 bg-gradient-to-br from-pink-50 via-white to-pink-50 flex items-center justify-center overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <img
          src={card.image}
          alt={card.name}
          loading="lazy"
          className="w-full h-full object-contain scale-110 group-hover:scale-125 transition-transform duration-500 relative z-10"
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
      </div>

      {/* Content */}
      <div className="px-5 pt-4 pb-5 flex flex-col flex-1">
        {/* Network badges */}
        {networkList.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {networkList.map((n) => (
              <span key={n} className="text-[10px] font-medium border border-slate-200 rounded-full px-2.5 py-1 text-slate-500 bg-slate-50">
                {n === "AmericanExpress" ? "Amex" : n}
              </span>
            ))}
          </div>
        )}

        <h3 className="font-display text-base font-bold text-[#0A0A0F] leading-snug line-clamp-2 mb-4 group-hover:text-[#FF1E7E] transition-colors">
          {card.name}
        </h3>

        {/* Button */}
        <div className="mt-auto">
          <Link
            to={card.alias ? `/cards/${card.alias}` : "/cards"}
            className="block w-full text-center text-sm font-semibold py-3 rounded-full bg-slate-50 text-slate-700 hover:bg-[#FF1E7E] hover:text-white transition-all"
          >
            View Details →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white border border-[#E5EAF0] rounded-xl overflow-hidden animate-pulse">
      <div className="h-44 bg-gray-100" />
      <div className="px-4 pt-3 pb-4 space-y-2">
        <div className="h-3 bg-gray-100 rounded w-1/4" />
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-12 bg-gray-100 rounded-lg mt-2" />
        <div className="flex gap-2 mt-2">
          <div className="h-9 bg-gray-100 rounded-lg flex-1" />
          <div className="h-9 bg-gray-100 rounded-lg flex-1" />
        </div>
      </div>
    </div>
  );
}

// ── Curated card aliases per tab (ordered) ───────────────────────────────────
const CURATED_ALIASES: Record<TabKey, string[]> = {
  picks: [
    "hdfc-regalia-gold-credit-card",
    "sbi-cashback-credit-card",
    "axis-bank-magnus-credit-card",
    "hdfc-millenia-credit-card",
    "icici-amazon-pay-credit-card",
    "axis-atlas-credit-card",
    "idfc-first-wealth-credit-card",
    "tata-neu-infinity-sbi-credit-card",
    "axis-flipkart-credit-card",
  ],
  best: [
    "hdfc-infinia-credit-card",
    "axis-bank-magnus-credit-card",
    "axis-atlas-credit-card",
    "hdfc-diners-club-black",
    "hdfc-regalia-gold-credit-card",
    "sbi-aurum-credit-card",
    "icici-emeralde-private-metal-credit-card",
    "hdfc-marriott-bonvoy-credit-card",
    "axis-bank-reserve-credit-card",
  ],
  beginner: [
    "icici-amazon-pay-credit-card",
    "idfc-first-select-credit-card",
    "axis-neo-credit-card",
    "scapia-credit-card",
    "hdfc-pixel-play-credit-card",
    "kiwi-klick-credit-card",
    "kotak-811-dream-different-credit-card",
    "rbl-bank-play-credit-card",
    "idfc-first-classic-credit-card",
  ],
  cashback: [
    "sbi-cashback-credit-card",
    "hdfc-millenia-credit-card",
    "icici-amazon-pay-credit-card",
    "axis-flipkart-credit-card",
    "axis-cashback-credit-card",
    "hdfc-swiggy-credit-card",
    "hdfc-pixel-play-credit-card",
    "flipkart-sbi-credit-card",
    "hdfc-tata-neu-plus-credit-card",
  ],
};

// ── Tab config with fetch params ─────────────────────────────────────────────
const TAB_CONFIG: Record<TabKey, { label: string; slug: string; free_cards: string; sort_by: string }> = {
  picks:    { label: "LAZYPAY's Picks", slug: "",                          free_cards: "",     sort_by: "priority" },
  best:     { label: "Best Cards",         slug: "best-travel-credit-card",   free_cards: "",     sort_by: "priority" },
  beginner: { label: "Beginner Cards",     slug: "",                          free_cards: "true", sort_by: "priority" },
  cashback: { label: "Best Cashback",      slug: "best-shopping-credit-card", free_cards: "",     sort_by: "priority" },
};

// ── Tabbed picks section ─────────────────────────────────────────────────────
function ShubhamPicks() {
  const [activeTab, setActiveTab] = useState<TabKey>("picks");
  const [cards, setCards] = useState<CardItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cache = useRef<Partial<Record<TabKey, CardItem[]>>>({});

  const fetchCardsForTab = (tabKey: TabKey) => {
    // Return cached result immediately
    if (cache.current[tabKey]) {
      setCards(cache.current[tabKey]!);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    setCards([]);

    const config = TAB_CONFIG[tabKey];
    const qs = new URLSearchParams({ sort_by: config.sort_by, limit: "200" });
    if (config.slug) qs.set("slug", config.slug);
    if (config.free_cards) qs.set("free_cards", config.free_cards);

    authManager
      .makeAuthenticatedRequest(`/api/proxy/cardgenius/cards?${qs}`, { method: "GET" })
      .then((r) => r.json())
      .then((data) => {
        const raw = parseRawCards(data);
        const curated = curateCards(raw, CURATED_ALIASES[tabKey]);
        cache.current[tabKey] = curated;
        setCards(curated);
      })
      .catch(() => {
        setError(`Failed to load ${TAB_CONFIG[tabKey].label}. Please try again.`);
      })
      .finally(() => setLoading(false));
  };

  // Load default tab on mount
  useEffect(() => { fetchCardsForTab("picks"); }, []); // eslint-disable-line

  const handleTabClick = (tabKey: TabKey) => {
    setActiveTab(tabKey);
    fetchCardsForTab(tabKey);
  };

  return (
    <section className="relative py-20 sm:py-28 bg-white overflow-hidden">
      <div className="absolute inset-0 lp-grid-bg opacity-30 pointer-events-none" />
      <div className="container relative z-10 max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="mb-12 flex flex-col items-center text-center">
          <div className="lp-eyebrow mb-5">
            <span>Curated Collections</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-[#0A0A0F] tracking-tight mb-4">
            Explore <span className="lp-gradient-text">LAZYPAY's Picks</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl">
            Hand-curated credit cards across categories, optimized for maximum rewards.
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-3 overflow-x-auto pb-1 mb-12 scrollbar-none justify-center flex-wrap">
          {(Object.keys(TAB_CONFIG) as TabKey[]).map((key) => (
            <button
              key={key}
              onClick={() => handleTabClick(key)}
              className={`flex-shrink-0 px-6 py-3 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === key
                  ? "bg-[#0A0A0F] text-white shadow-lg shadow-pink-500/20"
                  : "bg-white border border-slate-200 text-slate-600 hover:text-[#FF1E7E] hover:border-[#FF1E7E] hover:shadow-md"
              }`}
            >
              {TAB_CONFIG[key].label}
            </button>
          ))}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="flex flex-col items-center py-16 gap-4">
            <p className="text-gray-500 text-sm">{error}</p>
            <button
              onClick={() => fetchCardsForTab(activeTab)}
              className="px-6 py-2.5 rounded-lg bg-[#004E92] text-white text-sm font-semibold hover:bg-[#003A6E] transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Card grid */}
        {!loading && !error && cards.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {cards.map((card) => (
              <CardTile key={card.alias || card.name} card={card} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && cards.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">
            No cards found for this category.
          </div>
        )}
      </div>
    </section>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
const HomeLanding = () => {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    router.push(query.trim() ? `/cards?q=${encodeURIComponent(query.trim())}` : "/cards");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden lp-mesh-bg pt-32 sm:pt-40 pb-20 sm:pb-28">
          {/* Grid overlay */}
          <div className="absolute inset-0 lp-grid-bg opacity-40 pointer-events-none" />

          {/* Decorative orbs */}
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-gradient-to-br from-pink-400/30 to-purple-500/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 -left-20 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-pink-500/20 to-rose-300/20 blur-3xl pointer-events-none" />

          <div className="container relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto px-6">
            {/* Eyebrow */}
            <div className="lp-eyebrow lp-fade-up mb-8">
              <span>India's #1 AI-Powered Card Advisor</span>
            </div>

            {/* Main headline */}
            <h1 className="font-display lp-fade-up lp-fade-up-delay-1 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-[#0A0A0F] leading-[0.95] tracking-tight mb-6">
              Pay smarter.
              <br />
              <span className="lp-gradient-text">Live lazier.</span>
            </h1>

            <p className="lp-fade-up lp-fade-up-delay-2 text-lg sm:text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-10 font-light">
              Find credit cards that actually pay you back. AI-powered recommendations in under 60 seconds. No bias. No spam.
            </p>

            {/* Search bar */}
            <div className="lp-fade-up lp-fade-up-delay-3 w-full max-w-2xl mb-8">
              <div className="flex items-center gap-0 bg-white rounded-full shadow-2xl shadow-pink-500/10 overflow-hidden border border-pink-100">
                <div className="relative flex-1">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search by card name or bank..."
                    className="w-full pl-14 pr-4 h-16 text-base text-slate-800 bg-transparent outline-none placeholder:text-slate-400"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="lp-btn-primary h-14 mr-2 px-8 inline-flex items-center gap-2"
                >
                  Search
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="lp-fade-up lp-fade-up-delay-4 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/card-genius"
                className="lp-btn-primary inline-flex items-center gap-2 text-base"
              >
                Try AI Card Genius
                <ArrowUpRight className="w-5 h-5" />
              </Link>
              <Link
                to="/cards"
                className="lp-btn-ghost inline-flex items-center gap-2 text-base"
              >
                Browse All Cards
              </Link>
            </div>
          </div>
        </section>

        {/* ── Stat Strip ── */}
        <section className="relative overflow-hidden bg-[#0A0A0F] py-16">
          <div className="absolute inset-0 lp-dark-bg opacity-60" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF1E7E]/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF1E7E]/50 to-transparent" />

          <div className="container relative z-10 max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {STATS.map((s, i) => (
                <div key={s.label} className="flex flex-col items-center text-center group">
                  <span className="font-display text-4xl md:text-5xl font-bold leading-none mb-2 lp-gradient-text">
                    {s.value}
                  </span>
                  <span className="text-xs md:text-sm font-medium tracking-wider uppercase text-slate-400">
                    {s.label}
                  </span>
                  {i < STATS.length - 1 && (
                    <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-12 bg-white/10" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Shubham's Picks (tabbed) ── */}
        <ShubhamPicks />

        {/* ── Tools ── */}
        <AdvisorToolsGrid />
      </main>

      <Footer />
    </div>
  );
};

export default HomeLanding;
