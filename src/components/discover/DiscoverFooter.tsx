"use client";

import { Link } from "@/components/Link";
import { T } from "./theme";
import { LazyPayLogo } from "./Logo";

const YEAR = 2026;

const LINKS = [
  { label: "All cards", to: "/cards" },
  { label: "Card Genius", to: "/card-genius" },
  { label: "By category", to: "/card-genius-category" },
  { label: "Beat my card", to: "/beat-my-card" },
  { label: "FD cards", to: "/cards?lens=fd" },
];

const SOCIAL = [
  { label: "Instagram", href: "https://www.instagram.com/lazypay_official/" },
  { label: "YouTube", href: "https://www.youtube.com/@lazypayofficial" },
  { label: "Facebook", href: "https://www.facebook.com/lazypayofficial/" },
];

export function DiscoverFooter() {
  return (
    <footer style={{ borderTop: `1px solid ${T.line}`, background: T.surface }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "40px 24px 28px" }}>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between" style={{ gap: 28 }}>
          {/* brand + disclaimer */}
          <div style={{ maxWidth: 320 }}>
            <LazyPayLogo height={22} />
            <p style={{ marginTop: 14, fontSize: 13, lineHeight: 1.6, color: T.mute }}>
              We rank India&apos;s credit cards by how much money they save you. No ads, no paid ranks.
            </p>
            <div className="flex items-center" style={{ gap: 7, marginTop: 16 }}>
              <span style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: T.faint }}>
                Powered by
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: T.ink, letterSpacing: "-0.01em" }}>BankKaro</span>
            </div>
          </div>

          {/* links */}
          <div className="flex" style={{ gap: 48 }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: T.faint, marginBottom: 12 }}>
                Explore
              </div>
              <div className="flex flex-col" style={{ gap: 10 }}>
                {LINKS.map((l) => (
                  <Link key={l.to} to={l.to} style={{ fontSize: 14, color: T.ink, textDecoration: "none" }}>
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: T.faint, marginBottom: 12 }}>
                Follow
              </div>
              <div className="flex flex-col" style={{ gap: 10 }}>
                {SOCIAL.map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, color: T.ink, textDecoration: "none" }}>
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* legal */}
        <div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
          style={{ marginTop: 34, paddingTop: 20, borderTop: `1px solid ${T.line}`, gap: 8 }}
        >
          <span style={{ fontSize: 12, color: T.mute }}>
            © {YEAR} Pouring Pound India Private Limited. All rights reserved.
          </span>
          <span style={{ fontSize: 12, color: T.faint }}>
            Savings are estimates, not financial advice.
          </span>
        </div>
      </div>
    </footer>
  );
}
