"use client";
import { ArrowUpRight, Sparkles, Swords, LayoutGrid } from "lucide-react";
import { Link } from "@/components/Link";

const tools = [
  {
    icon: Sparkles,
    title: "Super Card Genius",
    description:
      "AI-powered recommendations for the perfect credit card based on your spending habits.",
    to: "/card-genius",
    bg: "linear-gradient(135deg, #FFE4EF 0%, #FFCEDF 100%)",
    iconBg: "bg-[#FF1E7E]",
    textColor: "text-pink-900",
    subColor: "text-pink-800/70",
  },
  {
    icon: Swords,
    title: "Beat My Card",
    description:
      "Find a better card than the one you already have. Compare benefits, fees, and rewards instantly.",
    to: "/beat-my-card",
    bg: "linear-gradient(135deg, #EFE9FB 0%, #DCD0F5 100%)",
    iconBg: "bg-purple-600",
    textColor: "text-purple-900",
    subColor: "text-purple-800/70",
  },
  {
    icon: LayoutGrid,
    title: "Category Card Genius",
    description:
      "Discover the best credit card for any spending category — fuel, travel, groceries, and more.",
    to: "/card-genius-category",
    bg: "linear-gradient(135deg, #FFEFD9 0%, #FFD9A8 100%)",
    iconBg: "bg-orange-500",
    textColor: "text-orange-900",
    subColor: "text-orange-800/70",
  },
];

const AdvisorToolsGrid = () => {
  return (
    <section className="relative bg-white py-16 sm:py-20 lg:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-14">
          <div className="lp-eyebrow mb-4 sm:mb-5">
            <span>LAZYPAY Toolkit</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#0A0A0F] mb-3 sm:mb-4 leading-[1.05]">
            Smart tools for{" "}
            <span className="lp-gradient-text">smarter cards</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto">
            Everything you need to make smarter credit card decisions, powered by AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {tools.map((tool) => (
            <Link
              to={tool.to}
              key={tool.title}
              className="group relative rounded-3xl p-6 sm:p-7 lg:p-8 flex flex-col transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl overflow-hidden"
              style={{ background: tool.bg }}
            >

              <div className="relative z-10 flex flex-col h-full">
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${tool.iconBg} mb-5 sm:mb-6 shadow-lg`}>
                  <tool.icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" strokeWidth={2.2} />
                </div>

                <h3 className={`font-display text-xl sm:text-2xl font-bold mb-2 sm:mb-3 ${tool.textColor}`}>
                  {tool.title}
                </h3>

                <p className={`text-sm leading-relaxed mb-5 sm:mb-6 flex-1 ${tool.subColor}`}>
                  {tool.description}
                </p>

                <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${tool.textColor} group-hover:gap-3 transition-all`}>
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
