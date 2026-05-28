"use client";
import { useRouter } from "next/navigation";
import { Link } from "@/components/Link";
import {
  HelpCircle,
  CreditCard,
  Sparkles,
  TrendingUp,
  LayoutGrid,
  ArrowRight,
  Home,
  User,
} from "lucide-react";

const AppLanding = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── App-style Header ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-md mx-auto px-5 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1.5">
            <div className="lp-logo-mark" />
            <span className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-[#0A0A0F]">
              LAZY<span className="text-[#FF1E7E]">PAY</span>
            </span>
          </Link>
          <button
            aria-label="Help"
            className="w-10 h-10 rounded-full border-2 border-slate-200 flex items-center justify-center hover:border-slate-300 transition-colors"
          >
            <HelpCircle className="w-5 h-5 text-slate-700" strokeWidth={2} />
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-md mx-auto w-full px-5 py-5 pb-24">
        {/* Greeting */}
        <div className="mb-5">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0A0A0F] leading-tight">
            Welcome 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            What would you like to explore today?
          </p>
        </div>

        {/* Top tile pair - like LAZYPAY app's PayLater/GiftCards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* PayLater-style tile */}
          <div
            className="rounded-3xl p-5 relative overflow-hidden aspect-[1/1.05]"
            style={{ background: "linear-gradient(135deg, #EFE9FB 0%, #DCD0F5 100%)" }}
          >
            <h3 className="font-display text-xl font-bold text-purple-800 mb-1.5 leading-tight">
              PayLater
            </h3>
            <p className="text-xs text-purple-700/80 leading-snug">
              Easy, one-tap<br />payments
            </p>
            <div className="absolute bottom-3 right-3 w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center rotate-[10deg]">
              <CreditCard className="w-7 h-7 text-purple-700" strokeWidth={2.2} />
            </div>
          </div>

          {/* GiftCards-style tile */}
          <div
            className="rounded-3xl p-5 relative overflow-hidden aspect-[1/1.05]"
            style={{ background: "linear-gradient(135deg, #FFE4E1 0%, #FFCED0 100%)" }}
          >
            <div className="flex items-start justify-between mb-1.5">
              <h3 className="font-display text-xl font-bold text-rose-700 leading-tight">
                GiftCards
              </h3>
              <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-500 text-white px-2 py-0.5 rounded-md">
                New
              </span>
            </div>
            <p className="text-xs text-rose-700/80 leading-snug">
              Discounts on 400+ brands
            </p>
            <div className="absolute bottom-3 right-3 w-14 h-14 rounded-2xl bg-rose-500/20 flex items-center justify-center rotate-[10deg]">
              <LayoutGrid className="w-7 h-7 text-rose-700" strokeWidth={2.2} />
            </div>
          </div>
        </div>

        {/* ⭐ HERO TILE — Best Credit Cards (links to website home) */}
        <button
          onClick={() => router.push("/home")}
          className="group block w-full text-left rounded-3xl overflow-hidden relative mb-4 transition-transform hover:scale-[1.01] active:scale-[0.99]"
          style={{
            background: "linear-gradient(160deg, #1a0d1f 0%, #2D0E2A 50%, #0A0A0F 100%)",
            minHeight: "260px",
          }}
        >
          {/* Decorative chevron pattern */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice">
              <path d="M0 130 L200 30 L400 130 L400 260 L0 260 Z" fill="rgba(255,30,126,0.15)" />
              <path d="M0 180 L200 80 L400 180 L400 260 L0 260 Z" fill="rgba(255,30,126,0.1)" />
            </svg>
          </div>

          {/* Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-[#FF1E7E]/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 p-7 sm:p-8 h-full flex flex-col">
            <span className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.18em] uppercase text-pink-200/80 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#FF1E7E]" />
              AI-Powered
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold leading-[1.05] mb-2">
              <span className="text-white">Find your</span>
              <br />
              <span className="text-[#FF1E7E]">best credit card</span>
            </h2>
            <p className="text-sm text-slate-300 mb-auto pb-6 max-w-xs">
              Personalized AI recommendations in 60 seconds. 130+ cards analyzed.
            </p>

            {/* Get Started button - white pill like the app */}
            <div className="mt-6">
              <span className="inline-flex w-full items-center justify-center gap-2 bg-white text-[#0A0A0F] font-bold text-base py-3.5 rounded-2xl group-hover:bg-pink-50 transition-colors">
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        </button>

        {/* Pagination dots like the app */}
        <div className="flex items-center justify-center gap-1.5 mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          <div className="w-5 h-1.5 rounded-full bg-[#FF1E7E]" />
        </div>

        {/* Quick action tiles */}
        <h3 className="font-display text-lg font-bold text-[#0A0A0F] mb-3 px-1">
          Quick Actions
        </h3>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <Link
            to="/card-genius"
            className="group rounded-2xl p-4 bg-white border border-slate-100 hover:border-pink-200 hover:shadow-lg transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center mb-2.5">
              <Sparkles className="w-5 h-5 text-[#FF1E7E]" strokeWidth={2.2} />
            </div>
            <h4 className="font-display text-sm font-bold text-[#0A0A0F] mb-0.5">
              AI Genius
            </h4>
            <p className="text-xs text-slate-500">Smart picks</p>
          </Link>

          <Link
            to="/beat-my-card"
            className="group rounded-2xl p-4 bg-white border border-slate-100 hover:border-purple-200 hover:shadow-lg transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mb-2.5">
              <TrendingUp className="w-5 h-5 text-purple-700" strokeWidth={2.2} />
            </div>
            <h4 className="font-display text-sm font-bold text-[#0A0A0F] mb-0.5">
              Beat My Card
            </h4>
            <p className="text-xs text-slate-500">Upgrade smarter</p>
          </Link>

          <Link
            to="/card-genius-category"
            className="group rounded-2xl p-4 bg-white border border-slate-100 hover:border-orange-200 hover:shadow-lg transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center mb-2.5">
              <LayoutGrid className="w-5 h-5 text-orange-600" strokeWidth={2.2} />
            </div>
            <h4 className="font-display text-sm font-bold text-[#0A0A0F] mb-0.5">
              By Category
            </h4>
            <p className="text-xs text-slate-500">Spend type</p>
          </Link>

          <Link
            to="/cards"
            className="group rounded-2xl p-4 bg-white border border-slate-100 hover:border-emerald-200 hover:shadow-lg transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-2.5">
              <CreditCard className="w-5 h-5 text-emerald-700" strokeWidth={2.2} />
            </div>
            <h4 className="font-display text-sm font-bold text-[#0A0A0F] mb-0.5">
              All Cards
            </h4>
            <p className="text-xs text-slate-500">Browse 130+</p>
          </Link>
        </div>
      </main>

      {/* ── Bottom Nav (like the app) ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-100 safe-area-inset-bottom">
        <div className="max-w-md mx-auto px-5 py-2.5 flex items-center justify-around">
          <button className="flex flex-col items-center gap-1 py-2 px-6">
            <div className="w-7 h-7 rounded-md border-2 border-[#0A0A0F] flex items-center justify-center">
              <Home className="w-4 h-4 text-[#0A0A0F]" strokeWidth={2.5} />
            </div>
            <span className="text-[11px] font-medium text-[#0A0A0F]">Home</span>
          </button>
          <button className="flex flex-col items-center gap-1 py-2 px-6">
            <User className="w-7 h-7 text-slate-400" strokeWidth={1.8} />
            <span className="text-[11px] font-medium text-slate-400">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default AppLanding;
