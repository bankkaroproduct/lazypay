"use client";

import { useEffect, useRef } from "react";
import { brandConfig } from "@/config/brand.config";
import { analytics } from "@/services/analytics";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, ShieldCheck, Zap } from "lucide-react";

const HeroSection = () => {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden lp-mesh-bg pt-32 sm:pt-36 pb-20 sm:pb-24 lg:pb-32 min-h-screen flex items-center">
      {/* Grid overlay */}
      <div className="absolute inset-0 lp-grid-bg opacity-50 pointer-events-none" />

      {/* Decorative orbs */}
      <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-gradient-to-br from-pink-400/30 to-purple-500/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full bg-gradient-to-tr from-pink-500/20 to-rose-300/20 blur-3xl pointer-events-none" />

      <div className="section-shell relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
          {/* Eyebrow badge */}
          <div className="lp-eyebrow lp-fade-up mb-8">
            <span>New • AI-Powered Card Genius</span>
          </div>

          {/* Main headline */}
          <h1 className="font-display lp-fade-up lp-fade-up-delay-1 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-[#0A0A0F] leading-[0.95] tracking-tight mb-6">
            Pay smarter.
            <br />
            <span className="lp-gradient-text">Live lazier.</span>
          </h1>

          {/* Subheadline */}
          <p className="lp-fade-up lp-fade-up-delay-2 text-lg sm:text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-10 font-light">
            Discover credit cards that actually pay you back. Get personalized recommendations powered by AI in under 60 seconds.
          </p>

          {/* CTA Buttons */}
          <div className="lp-fade-up lp-fade-up-delay-3 flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              onClick={() => {
                analytics.trackEvent({ category: 'Navigation', action: 'Hero Click', label: 'Discover Cards' });
                router.push("/cards");
                setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
              }}
              className="lp-btn-primary group inline-flex items-center gap-2 text-base"
            >
              Discover Cards
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => {
                analytics.trackGeniusStart('Hero Section');
                router.push("/card-genius");
                setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
              }}
              className="lp-btn-ghost inline-flex items-center gap-2 text-base"
            >
              <Sparkles className="w-5 h-5 text-[#FF1E7E]" />
              Try AI Genius
            </button>
          </div>

          {/* Trust indicators */}
          <div className="lp-fade-up lp-fade-up-delay-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#FF1E7E]" />
              <span className="font-medium">Bank-grade security</span>
            </div>
            <div className="w-px h-4 bg-slate-300 hidden sm:block" />
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#FF1E7E]" />
              <span className="font-medium">60-second recommendations</span>
            </div>
            <div className="w-px h-4 bg-slate-300 hidden sm:block" />
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FF1E7E]" />
              <span className="font-medium">100+ cards analyzed</span>
            </div>
          </div>
        </div>

        {/* Stats cards floating */}
        <div className="hidden lg:grid grid-cols-3 gap-6 mt-24 max-w-5xl mx-auto">
          <div className="lp-card p-8 lp-fade-up lp-fade-up-delay-4">
            <div className="text-5xl font-display font-bold text-[#0A0A0F] mb-2">
              ₹<span className="lp-gradient-text">2.4Cr+</span>
            </div>
            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Rewards Earned</div>
          </div>
          <div className="lp-card p-8 lp-fade-up lp-fade-up-delay-4">
            <div className="text-5xl font-display font-bold text-[#0A0A0F] mb-2">
              <span className="lp-gradient-text">100+</span>
            </div>
            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Cards Analyzed</div>
          </div>
          <div className="lp-card p-8 lp-fade-up lp-fade-up-delay-4">
            <div className="text-5xl font-display font-bold text-[#0A0A0F] mb-2">
              <span className="lp-gradient-text">4.9★</span>
            </div>
            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">User Rating</div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </section>
  );
};

export default HeroSection;
