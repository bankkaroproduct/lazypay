"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/components/Link";
import type { Card } from "@/lib/publicCards";
import { CATEGORIES, catRate, rupee } from "@/lib/discoverEngine";
import { calcCategorySavings, type SavingRow } from "@/lib/calcSavings";
import { T, cap, pill, serif } from "./theme";
import { CardObject } from "./CardObject";
import { Masthead } from "./Masthead";
import { BackPill } from "./BackPill";

const DINING_DEFAULT =
  CATEGORIES.find(([k]) => k === "dining")?.[2] ?? 6000;

/** Card art from a SavingRow (which isn't a full Card). */
const artFor = (r: { name: string; image: string; gradient: string }) =>
  ({ name: r.name, image: r.image, gradient: r.gradient } as unknown as Card);

export default function CategoryGeniusView({ cards }: { cards: Card[] }) {
  const [catSel, setCatSel] = useState("dining");
  const [spend, setSpend] = useState(DINING_DEFAULT);
  const [rows, setRows] = useState<SavingRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(true); // false = fell back to estimate
  const seq = useRef(0);

  const label =
    CATEGORIES.find(([k]) => k === catSel)?.[1] ?? catSel;

  /** Client-side fallback rows (used only if the real engine is unreachable). */
  const fallback = useMemo<SavingRow[]>(
    () =>
      [...cards]
        .map((c) => ({ c, back: spend * 12 * catRate(c, catSel) }))
        .sort((a, b) => b.back - a.back)
        .slice(0, 8)
        .map(({ c, back }) => ({
          id: c.id, name: c.name, alias: c.alias, image: c.image, gradient: c.gradient,
          annualFeeText: c.annualFee ? String(c.annualFee) : "0",
          savingsYearly: Math.round(back), applyUrl: c.applyUrl, topUsp: c.usps[0]?.header || "",
        })),
    [cards, catSel, spend]
  );

  // Debounced call to the real /calculate engine on every category/spend change.
  useEffect(() => {
    const id = ++seq.current;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await calcCategorySavings(catSel, spend);
        if (id !== seq.current) return; // a newer request superseded this one
        if (res.length) { setRows(res.slice(0, 8)); setLive(true); }
        else { setRows(fallback); setLive(false); }
      } catch {
        if (id !== seq.current) return;
        setRows(fallback); setLive(false);
      } finally {
        if (id === seq.current) setLoading(false);
      }
    }, 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catSel, spend]);

  const list = rows ?? fallback;

  return (
    <div
      style={{
        background: T.bg,
        color: T.ink,
        minHeight: "100vh",
        fontFamily: "var(--font-body)",
      }}
    >
      <Masthead back={{ label: "Cards", to: "/cards" }} kicker="By Category" />

      <main
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          padding: "22px 24px 90px",
          textAlign: "center",
        }}
      >
        <div style={{ marginBottom: 24, textAlign: "left" }}>
          <BackPill to="/cards" label="All cards" />
        </div>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: T.pink,
            marginBottom: 16,
          }}
        >
          Category Card Genius
        </div>

        <h1
          style={{
            fontFamily: serif,
            fontWeight: 500,
            fontSize: "clamp(34px,5vw,54px)",
            lineHeight: 1.04,
            margin: 0,
          }}
        >
          What do you spend{" "}
          <i style={{ color: T.pink, fontStyle: "italic" }}>most</i> on?
        </h1>

        <p
          style={{
            color: T.mute,
            fontSize: 15,
            lineHeight: 1.6,
            maxWidth: 520,
            margin: "18px auto 34px",
          }}
        >
          Pick one thing you buy a lot. Set the amount. We&apos;ll show the cards
          that pay you back the most on it.
        </p>

        <div
          className="flex flex-wrap justify-center"
          style={{ gap: 8, marginBottom: 30 }}
        >
          {CATEGORIES.map(([key, chipLabel, def]) => (
            <button
              key={key}
              style={pill(catSel === key)}
              onClick={() => {
                setCatSel(key);
                setSpend(def);
              }}
            >
              {chipLabel}
            </button>
          ))}
        </div>

        <div style={{ maxWidth: 560, margin: "0 auto 34px" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
            <span style={{ fontSize: 13 }}>
              Monthly {label.toLowerCase()} spend
            </span>
            <span
              style={{
                fontFamily: "var(--font-display), sans-serif",
                fontWeight: 700,
                color: T.pink,
              }}
            >
              ₹{spend.toLocaleString("en-IN")}
            </span>
          </div>
          <input
            type="range"
            className="sp"
            min={0}
            max={40000}
            step={500}
            value={spend}
            onChange={(e) => setSpend(Number(e.target.value))}
            style={{
              width: "100%",
              height: 3,
              WebkitAppearance: "none",
              appearance: "none",
              background: T.line,
              borderRadius: 3,
              accentColor: T.pink,
            }}
          />
          <style>{`
            .sp::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:${T.pink};cursor:pointer;border:3px solid ${T.bg}}
            .sp::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:${T.pink};cursor:pointer;border:3px solid ${T.bg}}
          `}</style>
        </div>

        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "left" }}>
          <div style={{ ...cap, marginBottom: 4, textAlign: "left" }}>
            Best cards for this category{" "}
            {loading && <span style={{ color: T.pink }}>· calculating…</span>}
          </div>

          <div style={{ opacity: loading ? 0.55 : 1, transition: "opacity .2s" }}>
            {list.map((r, i) => (
              <Link
                key={r.alias}
                to={`/cards/${r.alias}`}
                className="flex items-center"
                style={{
                  padding: "14px 0",
                  borderTop: `1px solid ${T.line}`,
                  cursor: "pointer",
                  gap: 14,
                  textDecoration: "none",
                  color: T.ink,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-display), sans-serif",
                    fontWeight: 700,
                    color: T.pink,
                    width: 22,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                <CardObject card={artFor(r)} size="sm" />

                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: serif, fontSize: 16 }}>{r.name}</div>
                  <div
                    style={{
                      fontSize: 11,
                      color: T.mute,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: 240,
                    }}
                  >
                    {r.topUsp || `on ${label}`}
                  </div>
                </div>

                <div style={{ marginLeft: "auto", textAlign: "right" }}>
                  <div
                    style={{
                      fontFamily: "var(--font-display), sans-serif",
                      fontWeight: 700,
                      fontSize: 19,
                      color: T.pink,
                    }}
                  >
                    {rupee(r.savingsYearly)}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      color: T.faint,
                    }}
                  >
                    saved / yr
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div style={{ marginTop: 14, fontSize: 10.5, color: T.faint, letterSpacing: "0.04em" }}>
            {live ? "Real savings, based on how you spend." : "Estimated savings (live engine is offline)."}
          </div>
        </div>
      </main>
    </div>
  );
}
