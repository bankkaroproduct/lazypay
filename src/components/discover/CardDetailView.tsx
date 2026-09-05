"use client";

import type { Card } from "@/lib/publicCards";
import { T, feeGst, serif, display } from "./theme";
import { topReward } from "@/lib/discoverEngine";
import { CardObject, Stars } from "./CardObject";
import { Masthead } from "./Masthead";
import { BackPill } from "./BackPill";
import { DiscoverFooter } from "./DiscoverFooter";
import { useComparison } from "@/contexts/ComparisonContext";
import { getCardKey } from "@/utils/cardAlias";
import { redirectToCardApplication } from "@/utils/redirectHandler";
import { Link } from "@/components/Link";

export default function CardDetailView({ card }: { card: Card }) {
  const { toggleCard, isSelected } = useComparison();
  const tr = topReward(card);
  const selected = isSelected(getCardKey(card.raw));

  return (
    <div
      style={{
        background: T.bg,
        color: T.ink,
        minHeight: "100vh",
        fontFamily: "var(--font-body)",
      }}
    >
      <Masthead />

      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 24px 120px" }}>
        <div style={{ marginBottom: 24 }}>
          <BackPill to="/cards" label="All cards" />
        </div>
        {/* Top area */}
        <div className="grid grid-cols-1 md:grid-cols-[360px_minmax(0,1fr)] items-start" style={{ gap: 48 }}>
          {/* LEFT */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                top: -14,
                left: -14,
                background: T.pink,
                color: T.onPink,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                padding: "5px 10px",
                borderRadius: 999,
                zIndex: 2,
              }}
            >
              Top pick
            </div>
            <CardObject card={card} size="hero" />
          </div>

          {/* RIGHT */}
          <div>
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: T.pink,
                marginBottom: 14,
              }}
            >
              {card.bank} · Credit card
            </div>
            <h1
              style={{
                fontFamily: serif,
                fontSize: "clamp(30px,4vw,46px)",
                lineHeight: 1.05,
                margin: 0,
              }}
            >
              {card.name}
            </h1>

            <div
              className="flex items-center"
              style={{ gap: 12, marginTop: 12, color: T.mute, fontSize: 13 }}
            >
              {card.rating > 0 && <Stars value={card.rating} />}
              <span>We ranked it for you</span>
            </div>

            <div className="flex" style={{ gap: 6, marginTop: 16 }}>
              {card.networks.map((n) => (
                <span
                  key={n}
                  style={{
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: T.mute,
                    border: `1px solid ${T.line}`,
                    borderRadius: 4,
                    padding: "3px 6px",
                  }}
                >
                  {n}
                </span>
              ))}
            </div>

            {/* Stats grid */}
            <div
              className="grid grid-cols-2 sm:grid-cols-3"
              style={{
                gap: 1,
                background: T.line,
                border: `1px solid ${T.line}`,
                borderRadius: 16,
                overflow: "hidden",
                margin: "36px 0",
              }}
            >
              <StatCell label="Joining (incl GST)" value={feeGst(card.joiningFee)} />
              <StatCell label="Annual (incl GST)" value={feeGst(card.annualFee)} />
              <StatCell label="Top reward">
                <span style={{ color: T.pink }}>
                  {tr.pct || "—"}
                  <span style={{ fontSize: 13, color: T.mute }}> {tr.cat}</span>
                </span>
              </StatCell>
              <StatCell label="Min income" value={card.minIncome} />
              <StatCell label="Min credit score" value={card.minScore} />
              <StatCell label="Networks">
                <span style={{ fontSize: 15 }}>{card.networks.join(" · ")}</span>
              </StatCell>
            </div>

            <Link
              to="/card-genius"
              style={{
                border: "1px solid rgba(255,30,126,0.5)",
                color: T.pink,
                borderRadius: 999,
                padding: "11px 20px",
                fontSize: 13,
                display: "inline-flex",
                background: "transparent",
                textDecoration: "none",
              }}
            >
              See how much this card saves you →
            </Link>
          </div>
        </div>

        {/* Why we picked it */}
        <h2
          style={{
            fontFamily: serif,
            fontStyle: "italic",
            fontSize: 22,
            margin: "36px 0 18px",
          }}
        >
          Why we picked it
        </h2>
        {card.usps.slice(0, 5).map((usp, i) => (
          <div
            key={i}
            className="flex"
            style={{ gap: 14, padding: "16px 0", borderTop: `1px solid ${T.line}` }}
          >
            <span
              style={{
                fontFamily: display,
                color: T.pink,
                fontWeight: 700,
                fontSize: 14,
                width: 26,
                flex: "none",
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{usp.header}</div>
              {usp.description && (
                <div
                  style={{
                    fontSize: 13,
                    color: T.mute,
                    marginTop: 4,
                    lineHeight: 1.5,
                  }}
                >
                  {usp.description}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Tags */}
        <div className="flex flex-wrap" style={{ gap: 8, marginTop: 26 }}>
          {card.tags.map((tag, i) => (
            <span
              key={i}
              style={{
                fontSize: 12,
                color: T.mute,
                border: `1px solid ${T.line}`,
                borderRadius: 999,
                padding: "6px 14px",
              }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      </main>

      <DiscoverFooter />

      {/* Sticky bottom bar */}
      <div
        className="flex items-center justify-between detail-applybar"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 46,
          borderTop: `1px solid ${T.line}`,
          background: "rgba(255,255,255,0.94)",
          backdropFilter: "blur(12px)",
          padding: "14px 20px",
          paddingBottom: "calc(14px + env(safe-area-inset-bottom))",
          gap: 16,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: T.faint,
            }}
          >
            Top reward
          </div>
          <div style={{ fontFamily: display, fontWeight: 700, fontSize: 20, color: T.pink, whiteSpace: "nowrap" }}>
            {tr.pct || "—"}
            <span style={{ fontSize: 13, color: T.mute }}> {tr.cat}</span>
          </div>
        </div>

        <div className="flex items-center" style={{ gap: 8, flex: "none" }}>
          <button
            type="button"
            onClick={() => toggleCard(card.raw)}
            aria-label="Compare"
            style={{
              background: "transparent",
              border: `1px solid ${selected ? T.pink : T.line}`,
              color: selected ? T.pink : T.ink,
              borderRadius: 999,
              padding: "9px 15px",
              fontSize: 13,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {selected ? "✓" : "+ Compare"}
          </button>
          <button
            type="button"
            onClick={() => redirectToCardApplication(card.raw)}
            style={{
              background: T.pink,
              color: T.onPink,
              border: "none",
              fontWeight: 700,
              fontSize: 14.5,
              padding: "11px 22px",
              borderRadius: 999,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Apply ↗
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCell({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div style={{ background: T.surface, padding: "18px 16px" }}>
      <div
        style={{
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: T.faint,
        }}
      >
        {label}
      </div>
      <div style={{ fontFamily: display, fontWeight: 700, fontSize: 22, marginTop: 6 }}>
        {children ?? value}
      </div>
    </div>
  );
}
