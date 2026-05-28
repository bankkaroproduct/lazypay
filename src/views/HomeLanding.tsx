"use client";
import { Search, Star, CreditCard, Users, TrendingUp, ArrowUpRight, Sparkles, LayoutGrid } from "lucide-react";
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
      <div className="h-32 sm:h-44 bg-gradient-to-br from-pink-50 via-white to-pink-50 flex items-center justify-center overflow-hidden relative">
        <img
          src={card.image}
          alt={card.name}
          loading="lazy"
          className="w-full h-full object-contain scale-110 group-hover:scale-125 transition-transform duration-500 relative z-10"
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
      </div>

      {/* Content */}
      <div className="px-3 sm:px-5 pt-3 sm:pt-4 pb-3 sm:pb-5 flex flex-col flex-1">
        {/* Network badges */}
        {networkList.length > 0 && (
          <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-2 sm:mb-3">
            {networkList.slice(0, 2).map((n) => (
              <span key={n} className="text-[9px] sm:text-[10px] font-medium border border-slate-200 rounded-full px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-slate-500 bg-slate-50">
                {n === "AmericanExpress" ? "Amex" : n}
              </span>
            ))}
          </div>
        )}

        <h3 className="font-display text-xs sm:text-base font-bold text-[#0A0A0F] leading-snug line-clamp-2 mb-3 sm:mb-4 group-hover:text-[#FF1E7E] transition-colors">
          {card.name}
        </h3>

        {/* Button */}
        <div className="mt-auto">
          <Link
            to={card.alias ? `/cards/${card.alias}` : "/cards"}
            className="block w-full text-center text-xs sm:text-sm font-semibold py-2 sm:py-2.5 rounded-full bg-slate-50 text-slate-700 hover:bg-[#FF1E7E] hover:text-white transition-all"
          >
            Details →
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
    <section className="relative py-14 sm:py-20 lg:py-24 bg-gradient-to-b from-pink-50/40 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-8 sm:mb-12 flex flex-col items-center text-center">
          <div className="lp-eyebrow mb-4 sm:mb-5">
            <span>Curated Collections</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#0A0A0F] tracking-tight mb-3 sm:mb-4 leading-[1.05]">
            <span className="lp-gradient-text">LAZYPAY's</span> top picks
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-xl">
            Hand-curated credit cards across categories, optimized for maximum rewards.
          </p>
        </div>

        {/* Tab bar - horizontal scroll on mobile */}
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 mb-8 sm:mb-10 scrollbar-none justify-start sm:justify-center -mx-5 px-5 sm:mx-0 sm:px-0">
          {(Object.keys(TAB_CONFIG) as TabKey[]).map((key) => (
            <button
              key={key}
              onClick={() => handleTabClick(key)}
              className={`flex-shrink-0 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === key
                  ? "bg-[#0A0A0F] text-white shadow-lg shadow-pink-500/20"
                  : "bg-white border border-slate-200 text-slate-600 hover:text-[#FF1E7E] hover:border-[#FF1E7E]"
              }`}
            >
              {TAB_CONFIG[key].label}
            </button>
          ))}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="flex flex-col items-center py-16 gap-4">
            <p className="text-gray-500 text-sm">{error}</p>
            <button
              onClick={() => fetchCardsForTab(activeTab)}
              className="lp-btn-primary text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {/* Card grid - mobile-first 2 cols */}
        {!loading && !error && cards.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
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
        {/* ── Hero — Editorial Asymmetric with floating card stack ── */}
        <section className="relative overflow-hidden lp-mesh-bg pt-24 sm:pt-32 pb-16 sm:pb-24 lg:pb-28">
          {/* Grid overlay */}
          <div className="absolute inset-0 lp-grid-bg opacity-100 pointer-events-none" />

          {/* Decorative orbs */}
          <div className="absolute -top-10 -right-10 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-br from-pink-400/30 to-purple-500/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-80 h-80 sm:w-[500px] sm:h-[500px] rounded-full bg-gradient-to-tr from-pink-500/20 to-rose-300/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-8 items-center">
              {/* LEFT — Text & search */}
              <div className="flex flex-col items-center text-center lg:items-start lg:text-left max-w-2xl mx-auto lg:mx-0">
                {/* Eyebrow badge */}
                <div className="lp-eyebrow lp-fade-up mb-5 sm:mb-7 text-[10px] sm:text-xs">
                  <span>India's #1 AI-Powered Card Advisor</span>
                </div>

                {/* Main headline */}
                <h1 className="font-display lp-fade-up lp-fade-up-delay-1 text-[2.75rem] sm:text-6xl md:text-7xl lg:text-[5.5rem] xl:text-8xl font-bold text-[#0A0A0F] leading-[0.92] tracking-tight mb-5 sm:mb-7">
                  Pay smarter.
                  <br />
                  <span className="lp-gradient-text">Live lazier.</span>
                </h1>

                <p className="lp-fade-up lp-fade-up-delay-2 text-base sm:text-lg md:text-xl text-slate-700 max-w-xl leading-relaxed mb-8 sm:mb-10">
                  Find credit cards that actually pay you back. AI-powered recommendations in under 60 seconds.
                </p>

                {/* Search bar */}
                <div className="lp-fade-up lp-fade-up-delay-3 w-full max-w-xl mb-4">
                  <div className="flex items-center gap-2 bg-white rounded-full shadow-xl shadow-pink-500/15 p-1.5 sm:p-2 border border-pink-100">
                    <div className="relative flex-1 min-w-0">
                      <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search cards or banks..."
                        className="w-full pl-11 sm:pl-14 pr-2 h-11 sm:h-12 text-sm sm:text-base text-slate-800 bg-transparent outline-none placeholder:text-slate-400"
                      />
                    </div>
                    <button
                      onClick={handleSearch}
                      className="lp-btn-primary h-11 sm:h-12 px-4 sm:px-7 inline-flex items-center gap-2 text-sm sm:text-base flex-shrink-0"
                    >
                      Search
                    </button>
                  </div>
                </div>

                {/* Explore All Cards CTA */}
                <div className="lp-fade-up lp-fade-up-delay-3 w-full max-w-xl mb-6">
                  <Link
                    to="/cards"
                    className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-full bg-white border-2 border-[#FF1E7E]/30 text-[#FF1E7E] font-semibold text-sm sm:text-base hover:bg-pink-50 hover:border-[#FF1E7E] transition-all"
                  >
                    Explore all 130+ cards
                    <ArrowUpRight className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>

                {/* Trust line */}
                <div className="lp-fade-up lp-fade-up-delay-4 flex flex-wrap items-center justify-center lg:justify-start gap-x-4 sm:gap-x-5 gap-y-2 text-xs sm:text-sm text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span>130+ cards</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                    <span>Bank-grade security</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    <span>100% free</span>
                  </div>
                </div>
              </div>

              {/* RIGHT — Floating card stack (desktop only) */}
              <div className="hidden lg:block relative h-[440px]">
                <div className="lp-card-stack absolute inset-0">
                  <div className="lp-floating-card lp-fc-1">
                    <img src="/cards/hdfc-infinia.png" alt="HDFC Infinia" loading="eager" />
                  </div>
                  <div className="lp-floating-card lp-fc-2">
                    <img src="/cards/axis-magnus.png" alt="Axis Magnus" loading="eager" />
                  </div>
                  <div className="lp-floating-card lp-fc-3">
                    <img src="/cards/amex-platinum.png" alt="Amex Platinum" loading="eager" />
                  </div>
                </div>

                {/* Floating reward badge */}
                <div className="absolute top-8 right-0 bg-white rounded-2xl shadow-xl border border-pink-100 px-4 py-3 z-10 animate-bounce" style={{ animationDuration: "3s" }}>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-pink-500">Avg. Saved</div>
                  <div className="font-display text-2xl font-bold text-[#0A0A0F]">₹42,000<span className="text-base text-slate-400">/yr</span></div>
                </div>

                {/* Floating AI badge */}
                <div className="absolute bottom-8 left-0 bg-[#0A0A0F] rounded-2xl shadow-xl px-4 py-3 z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#FF1E7E] animate-pulse" />
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-pink-200">AI Analyzing</div>
                  </div>
                  <div className="font-display text-sm font-bold text-white mt-1">Matching your spend pattern...</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Feature Tiles — Bento Grid ── */}
        <section className="relative bg-white pt-12 sm:pt-20 lg:pt-24 pb-12 sm:pb-16">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            {/* Section eyebrow */}
            <div className="flex items-end justify-between mb-8 sm:mb-10">
              <div>
                <div className="lp-eyebrow mb-3">
                  <span>Features</span>
                </div>
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0A0A0F] tracking-tight leading-[1.05]">
                  Built to make you <span className="lp-gradient-text">richer</span>
                </h2>
              </div>
              <Link
                to="/cards"
                className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-slate-700 hover:text-[#FF1E7E] transition-colors group"
              >
                See all
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>

            {/* Bento grid: 1 hero + 3 smaller */}
            <div className="grid grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 gap-3 sm:gap-4">
              {/* AI Genius — HERO tile, spans 2x2 on desktop */}
              <Link
                to="/card-genius"
                className="group col-span-2 lg:col-span-2 lg:row-span-2 relative rounded-3xl p-6 sm:p-8 lg:p-10 overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/10 min-h-[200px] lg:min-h-[420px] flex flex-col justify-between"
                style={{ background: "linear-gradient(135deg, #EFE9FB 0%, #D7C8F0 100%)" }}
              >
                {/* Decorative sparkle constellation */}
                <div className="absolute top-6 right-6 opacity-50 pointer-events-none">
                  <Sparkles className="w-4 h-4 text-purple-700 absolute top-0 right-0" />
                  <Sparkles className="w-6 h-6 text-purple-700 absolute top-8 right-12" />
                  <Sparkles className="w-3 h-3 text-purple-700 absolute top-16 right-4" />
                </div>

                {/* Big AI label */}
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 backdrop-blur mb-4 sm:mb-6">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-700 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-900">AI-Powered</span>
                  </div>
                  <h3 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-purple-950 leading-[0.95] mb-3 sm:mb-4">
                    Card<br />Genius
                  </h3>
                  <p className="text-sm sm:text-base text-purple-800/85 leading-relaxed max-w-xs">
                    Tell us how you spend. Our AI analyzes 130+ cards to find your perfect match in 60 seconds.
                  </p>
                </div>

                {/* Bottom: CTA + decorative icon */}
                <div className="relative z-10 flex items-end justify-between mt-6">
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-purple-900 group-hover:gap-2.5 transition-all">
                    Try it free
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center shadow-xl shadow-purple-500/30 rotate-6 group-hover:rotate-12 transition-transform duration-500">
                    <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" strokeWidth={2} />
                  </div>
                </div>
              </Link>

              {/* Discover Cards - Pink */}
              <Link
                to="/cards"
                className="group relative rounded-3xl p-5 sm:p-6 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl min-h-[160px] lg:min-h-[200px] flex flex-col justify-between"
                style={{ background: "linear-gradient(135deg, #FFE4EF 0%, #FFC4DB 100%)" }}
              >
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/70 backdrop-blur mb-3 sm:mb-4">
                    <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-[#FF1E7E]" strokeWidth={2.2} />
                  </div>
                  <h3 className="font-display font-bold text-lg sm:text-xl text-pink-900 leading-tight">
                    Discover
                  </h3>
                </div>
                <p className="relative z-10 text-xs sm:text-sm text-pink-800/80 leading-snug">
                  Browse 130+ cards
                </p>
              </Link>

              {/* Beat My Card - Mint */}
              <Link
                to="/beat-my-card"
                className="group relative rounded-3xl p-5 sm:p-6 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl min-h-[160px] lg:min-h-[200px] flex flex-col justify-between"
                style={{ background: "linear-gradient(135deg, #E0F4EC 0%, #BCE5D2 100%)" }}
              >
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/70 backdrop-blur mb-3 sm:mb-4">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-700" strokeWidth={2.2} />
                  </div>
                  <h3 className="font-display font-bold text-lg sm:text-xl text-emerald-900 leading-tight">
                    Beat My Card
                  </h3>
                </div>
                <p className="relative z-10 text-xs sm:text-sm text-emerald-800/80 leading-snug">
                  Upgrade smarter
                </p>
              </Link>

              {/* Category - Peach */}
              <Link
                to="/card-genius-category"
                className="group relative rounded-3xl p-5 sm:p-6 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl min-h-[160px] lg:min-h-[200px] flex flex-col justify-between"
                style={{ background: "linear-gradient(135deg, #FFEFD9 0%, #FFDA9A 100%)" }}
              >
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/70 backdrop-blur mb-3 sm:mb-4">
                    <LayoutGrid className="w-5 h-5 sm:w-6 sm:h-6 text-orange-700" strokeWidth={2.2} />
                  </div>
                  <h3 className="font-display font-bold text-lg sm:text-xl text-orange-900 leading-tight">
                    By Category
                  </h3>
                </div>
                <p className="relative z-10 text-xs sm:text-sm text-orange-800/80 leading-snug">
                  Find best per spend
                </p>
              </Link>

              {/* Stats mini-tile - Dark accent (4th smaller tile) */}
              <Link
                to="/blogs"
                className="group relative rounded-3xl p-5 sm:p-6 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl min-h-[160px] lg:min-h-[200px] flex flex-col justify-between bg-[#0A0A0F]"
              >
                <div className="absolute inset-0 lp-dark-bg opacity-60" />
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-pink-500/20 backdrop-blur mb-3 sm:mb-4">
                    <Star className="w-5 h-5 sm:w-6 sm:h-6 text-[#FF1E7E]" strokeWidth={2.2} />
                  </div>
                  <h3 className="font-display font-bold text-lg sm:text-xl text-white leading-tight">
                    Card Guides
                  </h3>
                </div>
                <p className="relative z-10 text-xs sm:text-sm text-slate-400 leading-snug">
                  Expert insights & tips
                </p>
              </Link>
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="relative bg-gradient-to-b from-white via-pink-50/30 to-white py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <div className="lp-eyebrow mb-4">
                <span>How it works</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0A0A0F] tracking-tight leading-[1.05]">
                Your perfect card in <span className="lp-gradient-text">three steps</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 relative">
              {/* Pink connecting line on desktop */}
              <div className="hidden md:block absolute top-12 left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-transparent via-pink-300 to-transparent pointer-events-none" />

              {[
                { num: "01", title: "Share how you spend", body: "Quick 60-second quiz on your monthly spend across categories. No login. No KYC.", icon: TrendingUp },
                { num: "02", title: "AI analyzes 130+ cards", body: "Our engine cross-references rewards, fees, joining bonuses, and your habits.", icon: Sparkles },
                { num: "03", title: "Get your match", body: "Personalized recommendations with savings forecast. Apply directly through us.", icon: CreditCard },
              ].map((step) => (
                <div key={step.num} className="relative flex flex-col items-center text-center bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
                  <div className="lp-step-number mb-2">{step.num}</div>
                  <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center mb-4 -mt-2">
                    <step.icon className="w-6 h-6 text-[#FF1E7E]" strokeWidth={2.2} />
                  </div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-[#0A0A0F] mb-2 leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Bank Marquee — Trust strip ── */}
        <section className="relative bg-white py-10 sm:py-14 overflow-hidden border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 mb-6 text-center">
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              Trusted by India's leading banks
            </p>
          </div>
          <div className="lp-marquee-mask overflow-hidden">
            <div className="lp-marquee-track">
              {[
                "HDFC Bank", "Axis Bank", "ICICI Bank", "SBI Card", "American Express",
                "Standard Chartered", "Kotak", "IDFC First", "RBL Bank", "Yes Bank",
                "HDFC Bank", "Axis Bank", "ICICI Bank", "SBI Card", "American Express",
                "Standard Chartered", "Kotak", "IDFC First", "RBL Bank", "Yes Bank",
              ].map((bank, i) => (
                <div key={i} className="flex-shrink-0 font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-300 hover:text-[#FF1E7E] transition-colors whitespace-nowrap">
                  {bank}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Stat Strip - Clean white version ── */}
        <section className="relative bg-gradient-to-b from-white to-pink-50/40 py-12 sm:py-16">
          <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-pink-500/5 p-6 sm:p-8 lg:p-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
                {STATS.map((s, i) => (
                  <div key={s.label} className="flex flex-col items-center text-center relative">
                    <span className="font-display text-3xl sm:text-4xl md:text-5xl font-bold leading-none mb-2 lp-gradient-text">
                      {s.value}
                    </span>
                    <span className="text-[10px] sm:text-xs font-semibold tracking-wider uppercase text-slate-500">
                      {s.label}
                    </span>
                    {i < STATS.length - 1 && (
                      <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-10 bg-slate-200" />
                    )}
                  </div>
                ))}
              </div>
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
