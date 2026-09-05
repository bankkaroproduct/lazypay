"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/components/Link";
import type { Card } from "@/lib/publicCards";
import { T, serif, display, ctaBtn } from "./theme";
import { SPEND_SLIDERS, defaultSpends, estimate, rupee } from "@/lib/discoverEngine";
import { calcSavings, type SavingRow } from "@/lib/calcSavings";
import { CardObject } from "./CardObject";
import { Masthead } from "./Masthead";
import { BackPill } from "./BackPill";

/** Card art from a SavingRow (which isn't a full Card). */
const artFor = (r: { name: string; image: string; gradient: string }) =>
  ({ name: r.name, image: r.image, gradient: r.gradient } as unknown as Card);

export default function CardGeniusView({ cards }: { cards: Card[] }) {
  const [spends, setSpends] = useState<Record<string, number>>(defaultSpends());
  const [rows, setRows] = useState<SavingRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(true); // false = fell back to estimate
  const seq = useRef(0);

  const total = SPEND_SLIDERS.reduce((s, [k]) => s + (spends[k] || 0), 0);
  const set = (key: string, value: number) => setSpends((p) => ({ ...p, [key]: value }));

  /** Client-side fallback rows (used only if the real engine is unreachable). */
  const fallback = useMemo<SavingRow[]>(
    () =>
      [...cards]
        .map((c) => ({ c, e: estimate(c, spends) }))
        .sort((a, b) => b.e.net - a.e.net)
        .slice(0, 8)
        .map(({ c, e }) => ({
          id: c.id, name: c.name, alias: c.alias, image: c.image, gradient: c.gradient,
          annualFeeText: c.annualFee ? String(c.annualFee) : "0",
          savingsYearly: Math.round(e.net), applyUrl: c.applyUrl, topUsp: c.usps[0]?.header || "",
        })),
    [cards, spends]
  );

  // Debounced call to the real /calculate engine on every spend change.
  useEffect(() => {
    const id = ++seq.current;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await calcSavings({
          amazon: spends.amazon, flipkart: spends.flipkart, other: spends.other,
          grocery: spends.grocery, dining: spends.dining, food: spends.food,
          fuel: spends.fuel, travel: spends.travel, bills: spends.bills,
        });
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
  }, [spends]);

  const list = rows ?? fallback;

  return (
    <div style={{ background: T.bg, color: T.ink, minHeight: "100vh", fontFamily: "var(--font-body)" }}>
      <style>{`
        input[type=range].sp::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:${T.pink};cursor:pointer;border:3px solid ${T.bg}}
        input[type=range].sp::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:${T.pink};cursor:pointer;border:3px solid ${T.bg}}
      `}</style>

      <Masthead back={{ label: "Cards", to: "/cards" }} kicker="Card Genius" />

      <main style={{ maxWidth: 1100, margin: "auto", padding: "22px 24px 140px" }}>
        <div style={{ marginBottom: 24 }}>
          <BackPill to="/cards" label="All cards" />
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, letterSpacing: ".3em", textTransform: "uppercase", color: T.pink, marginBottom: 16 }}>Card Genius</div>
          <h1 style={{ fontFamily: serif, fontWeight: 500, fontSize: "clamp(34px,5vw,54px)", lineHeight: 1.04, margin: 0 }}>
            Where does your <i style={{ color: T.pink, fontStyle: "italic" }}>money</i> go?
          </h1>
          <p style={{ color: T.mute, fontSize: 15, lineHeight: 1.6, maxWidth: 520, margin: "18px auto 40px", textAlign: "center" }}>
            Move the sliders to match how you spend each month. We&apos;ll show how much money each card saves you in a year.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start" style={{ minWidth: 0 }}>
          {/* LEFT — spend sliders */}
          <div className="flex flex-col gap-5">
            {SPEND_SLIDERS.map(([key, label, max]) => {
              const value = spends[key] || 0;
              return (
                <div key={key}>
                  <div className="flex justify-between" style={{ marginBottom: 8, alignItems: "baseline" }}>
                    <span style={{ fontSize: 13 }}>{label}</span>
                    <span style={{ fontFamily: display, fontWeight: 700, color: T.pink }}>₹{value.toLocaleString("en-IN")}</span>
                  </div>
                  <input className="sp" type="range" min={0} max={max} step={500} value={value}
                    onChange={(e) => set(key, Number(e.target.value))}
                    style={{ width: "100%", height: 3, appearance: "none", WebkitAppearance: "none", background: T.line, borderRadius: 3, accentColor: T.pink }} />
                </div>
              );
            })}
          </div>

          {/* RIGHT — real results */}
          <div id="genius-results" style={{ border: `1px solid ${T.line}`, borderRadius: 20, padding: 22, background: T.surface2, position: "sticky", top: 90, scrollMarginTop: 70 }}>
            <div className="flex justify-between" style={{ fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: T.faint }}>
              <span>Your best cards {loading && <span style={{ color: T.pink }}>· calculating…</span>}</span>
              <span style={{ color: T.ink }}>₹{total.toLocaleString("en-IN")}/mo</span>
            </div>

            <div style={{ marginTop: 8, opacity: loading ? 0.55 : 1, transition: "opacity .2s" }}>
              {list.map((r, i) => (
                <Link key={r.alias} to={`/cards/${r.alias}`} className="flex"
                  style={{ padding: "14px 0", borderTop: `1px solid ${T.line}`, cursor: "pointer", alignItems: "center", gap: 12, textDecoration: "none", color: "inherit" }}>
                  <span style={{ fontFamily: display, fontWeight: 700, color: T.pink, width: 22 }}>{String(i + 1).padStart(2, "0")}</span>
                  <CardObject card={artFor(r)} size="sm" />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: serif, fontSize: 16 }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: T.mute, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 200 }}>
                      {r.topUsp || (r.annualFeeText && r.annualFeeText !== "0" ? `₹${Number(r.annualFeeText.replace(/[^0-9]/g, "")) || 0} annual` : "Lifetime free")}
                    </div>
                  </div>
                  <div style={{ marginLeft: "auto", textAlign: "right" }}>
                    <div style={{ fontFamily: display, fontWeight: 700, fontSize: 19, color: T.pink }}>{rupee(r.savingsYearly)}</div>
                    <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".12em", color: T.faint }}>saved / yr</div>
                  </div>
                </Link>
              ))}
            </div>
            <div style={{ marginTop: 14, fontSize: 10.5, color: T.faint, letterSpacing: ".04em" }}>
              {live ? "Real savings, based on how you spend." : "Estimated savings (live engine is offline)."}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile: keep the best result pinned while you drag sliders */}
      {list[0] && (
        <div className="lg:hidden" style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 40, borderTop: `1px solid ${T.line}`, background: "rgba(255,255,255,0.96)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", paddingBottom: "calc(10px + env(safe-area-inset-bottom))", gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 9.5, letterSpacing: "0.16em", textTransform: "uppercase", color: T.faint }}>Your best card {loading && <span style={{ color: T.pink }}>·…</span>}</div>
            <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 180 }}>{list[0].name}</div>
          </div>
          <div className="flex items-center" style={{ gap: 12 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: display, fontWeight: 700, fontSize: 18, color: T.pink, lineHeight: 1 }}>{rupee(list[0].savingsYearly)}</div>
              <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: T.faint, marginTop: 2 }}>saved / yr</div>
            </div>
            <button onClick={() => document.getElementById("genius-results")?.scrollIntoView({ behavior: "smooth", block: "start" })} style={{ ...ctaBtn, fontSize: 12, padding: "8px 14px", whiteSpace: "nowrap" }}>See all</button>
          </div>
        </div>
      )}
    </div>
  );
}
