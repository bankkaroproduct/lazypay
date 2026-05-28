"use client";
import { ArrowUpRight, Sparkles, Swords, LayoutGrid } from "lucide-react";
import { Link } from "@/components/Link";

const tools = [
  {
    icon: Sparkles,
    title: "Super Card Genius",
    description:
      "Get AI-powered recommendations for the perfect credit card based on your spending habits.",
    to: "/card-genius",
    accent: "from-pink-500 to-rose-500",
  },
  {
    icon: Swords,
    title: "Beat My Card",
    description:
      "Find a better card than the one you already have — compare benefits, fees, and rewards instantly.",
    to: "/beat-my-card",
    accent: "from-fuchsia-500 to-pink-500",
  },
  {
    icon: LayoutGrid,
    title: "Category Card Genius",
    description:
      "Discover the best credit card for any spending category — fuel, travel, groceries, and more.",
    to: "/card-genius-category",
    accent: "from-purple-500 to-pink-500",
  },
];

const AdvisorToolsGrid = () => {
  return (
    <section className="relative py-20 sm:py-28 bg-[#0A0A0F] overflow-hidden">
      <div className="absolute inset-0 lp-dark-bg opacity-70" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/10 blur-3xl pointer-events-none" />

      <div className="container relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="lp-eyebrow mb-5">
            <span>LAZYPAY Toolkit</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4">
            Powerful tools.
            <br />
            <span className="lp-gradient-text">Smarter decisions.</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Everything you need to make smarter credit card decisions, powered by AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Link
              to={tool.to}
              key={tool.title}
              className="group relative rounded-3xl p-8 flex flex-col transition-all duration-500 hover:-translate-y-2 overflow-hidden"
            >
              {/* Gradient border effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10" />
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-pink-500/20 to-transparent border border-pink-500/30" />

              {/* Glow */}
              <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br ${tool.accent} opacity-0 group-hover:opacity-30 blur-3xl transition-opacity duration-500`} />

              <div className="relative z-10 flex flex-col h-full">
                {/* Icon */}
                <div className={`inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br ${tool.accent} mb-6 shadow-lg shadow-pink-500/20`}>
                  <tool.icon className="h-7 w-7 text-white" strokeWidth={2.2} />
                </div>

                <h3 className="font-display text-2xl font-bold mb-3 text-white">
                  {tool.title}
                </h3>

                <p className="text-sm leading-relaxed mb-6 flex-1 text-slate-400">
                  {tool.description}
                </p>

                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#FF1E7E] group-hover:gap-3 transition-all">
                  Try Now <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AdvisorToolsGrid;
