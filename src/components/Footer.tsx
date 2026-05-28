"use client";
import { Link } from "@/components/Link";
import { useMemo, useState } from "react";
import { ChevronDown, ArrowUpRight, Mail, Sparkles } from "lucide-react";
import { brandConfig } from "@/config/brand.config";
import { analytics } from "@/services/analytics";

const Footer = () => {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const sections = useMemo(() => ([
    {
      id: "product",
      title: "Product",
      links: [
        { label: "Discover Cards", to: "/cards" },
        { label: "AI Card Genius", to: "/card-genius" },
        { label: "Category Genius", to: "/card-genius-category" },
        { label: "Beat My Card", to: "/beat-my-card" },
      ]
    },
    {
      id: "company",
      title: "Company",
      links: [
        { label: "About", to: "/about" },
        { label: "Blogs", to: "/blogs" },
        { label: "Contact", to: `mailto:${brandConfig.email}`, external: true },
      ]
    },
    {
      id: "legal",
      title: "Legal",
      links: [
        { label: "Privacy Policy", to: "https://lazypay.com/privacy-policy", external: true },
        { label: "Terms of Service", to: "https://lazypay.com/terms-conditions", external: true },
      ]
    }
  ]), []);

  return (
    <footer className="relative overflow-hidden text-white">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0A0A0F]" />
      <div className="absolute inset-0 lp-dark-bg opacity-80" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF1E7E]/50 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-20 sm:pt-24 pb-10">
        {/* Top CTA section */}
        <div className="mb-16 pb-16 border-b border-white/10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 mb-4">
                <Sparkles className="w-3.5 h-3.5 text-[#FF1E7E]" />
                <span className="text-xs font-semibold text-[#FF1E7E] uppercase tracking-wider">Ready to start?</span>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-3">
                Find your <span className="lp-gradient-text">perfect card</span>
              </h2>
              <p className="text-slate-400 text-lg">
                Personalized recommendations in 60 seconds. No spam, no commitment.
              </p>
            </div>
            <Link to="/card-genius" className="lp-btn-primary inline-flex items-center gap-2 whitespace-nowrap">
              Get Started
              <ArrowUpRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Footer grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
          {/* Brand column */}
          <div className="md:col-span-5">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="lp-logo-mark" />
              <span className="font-display text-2xl font-extrabold tracking-tight">
                LAZY<span className="text-[#FF1E7E]">PAY</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm mb-6">
              Smart payment solutions for everyone. Discover credit cards that actually pay you back with AI-powered recommendations.
            </p>
            <a
              href={`mailto:${brandConfig.email}`}
              className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-[#FF1E7E] transition-colors group"
            >
              <Mail className="w-4 h-4" />
              <span className="border-b border-transparent group-hover:border-[#FF1E7E]">{brandConfig.email}</span>
            </a>
          </div>

          {/* Links columns - desktop */}
          <div className="hidden md:grid md:col-span-7 grid-cols-3 gap-8">
            {sections.map(section => (
              <div key={section.id}>
                <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500 mb-5">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map(link => (
                    <li key={link.label}>
                      {link.external ? (
                        <a
                          href={link.to}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-300 hover:text-white transition-colors text-sm inline-flex items-center gap-1 group"
                          onClick={() => analytics.trackFooterClick(link.label)}
                        >
                          {link.label}
                          <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      ) : (
                        <Link
                          to={link.to}
                          className="text-slate-300 hover:text-white transition-colors text-sm"
                          onClick={() => analytics.trackFooterClick(link.label)}
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Mobile accordion */}
          <div className="md:hidden space-y-2">
            {sections.map(section => {
              const isOpen = openSection === section.id;
              return (
                <div key={section.id} className="border border-white/10 rounded-xl overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between px-4 py-3.5"
                    onClick={() => setOpenSection(isOpen ? null : section.id)}
                  >
                    <span className="font-semibold text-sm">{section.title}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <ul className="px-4 pb-4 space-y-3">
                      {section.links.map(link => (
                        <li key={link.label}>
                          {link.external ? (
                            <a href={link.to} target="_blank" rel="noopener noreferrer" className="text-slate-300 text-sm">{link.label}</a>
                          ) : (
                            <Link to={link.to} className="text-slate-300 text-sm">{link.label}</Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} LAZYPAY. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-slate-500">
            <a href="https://www.instagram.com/lazypay_official/" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF1E7E] transition-colors">Instagram</a>
            <a href="https://www.youtube.com/@lazypayofficial" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF1E7E] transition-colors">YouTube</a>
            <a href="https://www.facebook.com/lazypayofficial/" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF1E7E] transition-colors">Facebook</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
