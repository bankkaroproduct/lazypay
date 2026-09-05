"use client";

import { useState } from "react";
import { Link } from "@/components/Link";
import { analytics } from "@/services/analytics";
import { T } from "./theme";
import { LazyPayLogo } from "./Logo";

const NAV = [
  { label: "Card Genius", to: "/card-genius" },
  { label: "By Category", to: "/card-genius-category" },
  { label: "Beat My Card", to: "/beat-my-card" },
];

/** Web-view top bar. `back` renders a subtle chevron link; nav collapses to a menu on mobile. */
export function Masthead({
  kicker,
  showNav = true,
}: {
  kicker?: string;
  /** Deprecated: back navigation now renders as a BackPill in the page body. */
  back?: { label: string; to: string };
  showNav?: boolean;
}) {
  const [menu, setMenu] = useState(false);

  return (
    <header
      style={{
        position: "sticky", top: 0, zIndex: 30,
        borderBottom: `1px solid ${T.line}`,
        background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)",
      }}
    >
      <div
        style={{ maxWidth: 1160, margin: "0 auto", padding: "12px 20px" }}
        className="flex items-center justify-between gap-3"
      >
        {/* left: brand, leftmost */}
        <div className="flex items-center gap-3" style={{ minWidth: 0 }}>
          <Link to="/cards" style={{ textDecoration: "none", flex: "none" }}>
            <LazyPayLogo height={22} />
          </Link>
          {kicker && (
            <span
              className="hidden sm:inline"
              style={{ fontSize: 10, letterSpacing: "0.26em", textTransform: "uppercase", color: T.faint, whiteSpace: "nowrap" }}
            >
              {kicker}
            </span>
          )}
        </div>

        {showNav && (
          <>
            {/* desktop inline nav */}
            <nav className="hidden md:flex items-center gap-6" style={{ fontSize: 13 }}>
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => analytics.trackMenuClick(n.label)}
                  style={{ whiteSpace: "nowrap", color: T.mute, textDecoration: "none", transition: "color .2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = T.ink)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = T.mute)}
                >
                  {n.label}
                </Link>
              ))}
            </nav>

            {/* mobile menu button */}
            <button
              className="md:hidden"
              onClick={() => setMenu((o) => !o)}
              aria-label="Menu"
              aria-expanded={menu}
              style={{
                flex: "none", width: 38, height: 38, borderRadius: 12,
                border: `1px solid ${T.line}`, background: T.surface,
                color: T.ink, cursor: "pointer", display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 4,
              }}
            >
              <span style={{ width: 16, height: 1.6, background: menu ? "transparent" : T.ink, transition: "all .2s" }} />
              <span style={{ width: 16, height: 1.6, background: T.ink }} />
              <span style={{ width: 16, height: 1.6, background: menu ? "transparent" : T.ink, transition: "all .2s" }} />
            </button>
          </>
        )}
      </div>

      {/* mobile dropdown */}
      {showNav && menu && (
        <div
          className="md:hidden"
          style={{ borderTop: `1px solid ${T.line}`, background: T.surface, padding: "6px 20px 14px" }}
        >
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => { analytics.trackMenuClick(n.label); setMenu(false); }}
              style={{
                display: "block", padding: "12px 0", color: T.ink, textDecoration: "none",
                fontSize: 16, borderBottom: `1px solid ${T.line}`,
              }}
            >
              {n.label}
            </Link>
          ))}
          <Link
            to="/"
            onClick={() => setMenu(false)}
            style={{ display: "block", padding: "12px 0", color: T.mute, textDecoration: "none", fontSize: 14 }}
          >
            ‹ Back to app
          </Link>
        </div>
      )}
    </header>
  );
}
