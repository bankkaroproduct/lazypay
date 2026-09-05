"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/components/Link";
import type { Card } from "@/lib/publicCards";
import {
  SPEND_SLIDERS,
  defaultSpends,
  estimate,
  rupee,
  type Spends,
} from "@/lib/discoverEngine";
import { calcSavings, type SavingRow } from "@/lib/calcSavings";
import { T, cap, serif, display, ctaBtn } from "@/components/discover/theme";
import { CardObject } from "@/components/discover/CardObject";
import { Masthead } from "@/components/discover/Masthead";
import { BackPill } from "@/components/discover/BackPill";

/** Card art from a SavingRow (which isn't a full Card). */
const artFor = (r: { name: string; image: string; gradient: string }) =>
  ({ name: r.name, image: r.image, gradient: r.gradient } as unknown as Card);

export function BeatMyCardView({ cards }: { cards: Card[] }) {
  const [beatCard, setBeatCard] = useState<string>("");
  const [spends, setSpends] = useState<Spends>(defaultSpends());
  const [rows, setRows] = useState<SavingRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(true); // false = fell back to estimate
  const seq = useRef(0);

  const total = SPEND_SLIDERS.reduce((s, [k]) => s + (spends[k] || 0), 0);

  /** Client-side fallback rows (used only if the real engine is unreachable). */
  const fallback = useMemo<SavingRow[]>(
    () =>
      [...cards]
        .map((c) => ({ c, e: estimate(c, spends) }))
        .sort((a, b) => b.e.net - a.e.net)
        .map(({ c, e }) => ({
          id: c.id,
          name: c.name,
          alias: c.alias,
          image: c.image,
          gradient: c.gradient,
          annualFeeText: c.annualFee ? String(c.annualFee) : "0",
          savingsYearly: Math.round(e.net),
          applyUrl: c.applyUrl,
          topUsp: c.usps[0]?.header || "",
        })),
    [cards, spends]
  );

  // Debounced call to the real /calculate engine on every spend change.
  useEffect(() => {
    const id = ++seq.current;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await calcSavings(spends as any);
        if (id !== seq.current) return; // a newer request superseded this one
        if (res.length) {
          setRows(res);
          setLive(true);
        } else {
          setRows(fallback);
          setLive(false);
        }
      } catch {
        if (id !== seq.current) return;
        setRows(fallback);
        setLive(false);
      } finally {
        if (id === seq.current) setLoading(false);
      }
    }, 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spends]);

  const all = rows ?? fallback;

  // Derive the verdict from the ranked list + the selected card.
  const cur = beatCard ? all.find((r) => r.alias === beatCard) : undefined;
  const curCard = beatCard ? cards.find((c) => c.alias === beatCard) : undefined;
  const curName = cur?.name ?? curCard?.name ?? "";
  const curSaving = cur?.savingsYearly ?? 0;
  const better = beatCard
    ? all
        .filter((r) => r.alias !== beatCard && r.savingsYearly > curSaving)
        .slice(0, 3)
    : [];
  const best = better[0];

  return (
    <div
      style={{
        background: T.bg,
        color: T.ink,
        minHeight: "100vh",
        fontFamily: "var(--font-body)",
      }}
    >
      <Masthead back={{ label: "Cards", to: "/cards" }} kicker="Beat My Card" />

      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "22px 24px 140px" }}>
        <div style={{ marginBottom: 24 }}>
          <BackPill to="/cards" label="All cards" />
        </div>
        <div
          style={{
            textAlign: "center",
            fontSize: 11,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: T.pink,
            marginBottom: 16,
          }}
        >
          Beat My Card
        </div>

        <h1
          style={{
            textAlign: "center",
            fontFamily: serif,
            fontWeight: 500,
            fontSize: "clamp(34px,5vw,54px)",
            lineHeight: 1.04,
            margin: 0,
          }}
        >
          Is your card{" "}
          <i style={{ color: T.pink, fontStyle: "italic" }}>losing</i> you money?
        </h1>

        <p
          style={{
            textAlign: "center",
            color: T.mute,
            fontSize: 15,
            lineHeight: 1.6,
            maxWidth: 560,
            margin: "18px auto 34px",
          }}
        >
          Tell us your card and how you spend. We&apos;ll show if{" "}
          <em style={{ fontStyle: "italic" }}>another</em> card saves you more money.
        </p>

        {/* Step 1 */}
        <div style={{ textAlign: "center", margin: "10px 0 30px" }}>
          <span style={cap}>1 · Your current card</span>
          <select
            value={beatCard}
            onChange={(e) => setBeatCard(e.target.value)}
            style={{
              display: "block",
              margin: "8px auto 0",
              background: T.surface2,
              color: T.ink,
              border: `1px solid ${T.line}`,
              borderRadius: 12,
              padding: "12px 14px",
              fontSize: 15,
              width: "100%",
              maxWidth: 360,
              boxSizing: "border-box",
              textAlign: "center",
            }}
          >
            <option value="">Select your card…</option>
            {cards.map((c) => (
              <option key={c.alias} value={c.alias}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Step 2 */}
        <div style={{ ...cap, textAlign: "center", marginBottom: 14 }}>
          2 · Your monthly spend
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start" style={{ minWidth: 0 }}>
          {/* LEFT: sliders */}
          <div>
            <style>{`
              .sp::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 18px;
                height: 18px;
                border-radius: 50%;
                background: ${T.pink};
                border: 3px solid ${T.bg};
                cursor: pointer;
              }
              .sp::-moz-range-thumb {
                width: 18px;
                height: 18px;
                border-radius: 50%;
                background: ${T.pink};
                border: 3px solid ${T.bg};
                cursor: pointer;
              }
            `}</style>

            {SPEND_SLIDERS.map(([key, label, max]) => {
              const value = spends[key] || 0;
              return (
                <div key={key} style={{ marginBottom: 18 }}>
                  <div className="flex justify-between" style={{ marginBottom: 8 }}>
                    <span style={{ fontSize: 13 }}>{label}</span>
                    <span style={{ fontFamily: display, fontWeight: 700, color: T.pink }}>
                      ₹{value.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <input
                    className="sp"
                    type="range"
                    min={0}
                    max={max}
                    step={500}
                    value={value}
                    onChange={(e) =>
                      setSpends((s) => ({ ...s, [key]: Number(e.target.value) }))
                    }
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
                </div>
              );
            })}
          </div>

          {/* RIGHT: verdict */}
          <div
            id="beat-verdict"
            style={{
              border: `1px solid ${T.line}`,
              borderRadius: 20,
              padding: 22,
              background: T.surface2,
              position: "sticky",
              top: 90,
              scrollMarginTop: 70,
            }}
          >
            <div className="flex justify-between" style={{ ...cap, marginBottom: 16 }}>
              <span>
                The verdict{" "}
                {loading && <span style={{ color: T.pink }}>· calculating…</span>}
              </span>
              <span>₹{total.toLocaleString("en-IN")}/mo</span>
            </div>

            {!beatCard ? (
              <div
                style={{
                  color: T.mute,
                  fontSize: 14,
                  lineHeight: 1.6,
                  padding: "8px 0",
                }}
              >
                Pick your card above and set your spends. We&apos;ll show if a
                switch saves you money.
              </div>
            ) : (
              <>
                <div
                  style={{
                    fontSize: 13,
                    color: T.mute,
                    borderBottom: `1px solid ${T.line}`,
                    paddingBottom: 14,
                    marginBottom: 16,
                  }}
                >
                  Your <b style={{ color: T.ink }}>{curName}</b> saves{" "}
                  <b style={{ color: T.pink }}>{rupee(curSaving)}</b>/yr on ₹
                  {total.toLocaleString("en-IN")}/mo.
                </div>

                <div className="flex items-center" style={{ gap: 16, margin: "4px 0 16px" }}>
                  <div
                    style={{
                      fontFamily: serif,
                      fontStyle: "italic",
                      fontSize: 19,
                      lineHeight: 1.25,
                    }}
                  >
                    {!best ? (
                      <>
                        Nice —{" "}
                        <b style={{ color: T.pink, fontStyle: "normal" }}>{curName}</b>{" "}
                        already beats every other card on your spends. Keep it.
                      </>
                    ) : (
                      <>
                        <b style={{ color: T.pink, fontStyle: "normal" }}>
                          {best.name}
                        </b>{" "}
                        would save you{" "}
                        <b style={{ color: T.pink, fontStyle: "normal" }}>
                          {rupee(best.savingsYearly - curSaving)}
                        </b>{" "}
                        more a year than {curName} — on your spends.
                      </>
                    )}
                  </div>
                  {best ? (
                    <CardObject card={artFor(best)} size="sm" />
                  ) : curCard ? (
                    <CardObject card={curCard} size="sm" />
                  ) : null}
                </div>

                {better.length > 0 && (
                  <>
                    <div
                      style={{
                        fontFamily: serif,
                        fontStyle: "italic",
                        fontSize: 20,
                        margin: "8px 0 4px",
                      }}
                    >
                      Cards that save you more
                    </div>

                    {better.map((r, i) => (
                      <Link
                        key={r.alias}
                        to={`/cards/${r.alias}`}
                        className="flex items-center"
                        style={{
                          padding: "14px 0",
                          borderTop: `1px solid ${T.line}`,
                          gap: 14,
                          cursor: "pointer",
                          textDecoration: "none",
                          color: T.ink,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: display,
                            fontWeight: 700,
                            color: T.pink,
                            width: 22,
                          }}
                        >
                          {i + 1}
                        </span>
                        <CardObject card={artFor(r)} size="sm" />
                        <div>
                          <div style={{ fontFamily: serif, fontSize: 16 }}>{r.name}</div>
                          <div style={{ fontSize: 11, color: T.mute }}>
                            {rupee(r.savingsYearly)} saved/yr
                          </div>
                        </div>
                        <div style={{ marginLeft: "auto", textAlign: "right" }}>
                          <div
                            style={{
                              fontFamily: display,
                              fontWeight: 700,
                              fontSize: 19,
                              color: T.pink,
                            }}
                          >
                            +{rupee(r.savingsYearly - curSaving)}
                          </div>
                          <div
                            style={{
                              fontSize: 10,
                              textTransform: "uppercase",
                              color: T.faint,
                            }}
                          >
                            vs your card
                          </div>
                        </div>
                      </Link>
                    ))}
                  </>
                )}
              </>
            )}

            <div style={{ marginTop: 14, fontSize: 10.5, color: T.faint, letterSpacing: ".04em" }}>
              {live ? "Real savings, based on how you spend." : "Estimated savings (live engine is offline)."}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile: pin the verdict while you pick a card / drag sliders */}
      <div className="lg:hidden" style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 40, borderTop: `1px solid ${T.line}`, background: "rgba(255,255,255,0.96)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", paddingBottom: "calc(10px + env(safe-area-inset-bottom))", gap: 12 }}>
        {!beatCard ? (
          <div style={{ fontSize: 13, color: T.mute }}>Pick your card above to compare ↑</div>
        ) : best ? (
          <>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 9.5, letterSpacing: "0.16em", textTransform: "uppercase", color: T.faint }}>Switch &amp; save more</div>
              <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 170 }}>{best.name}</div>
            </div>
            <div className="flex items-center" style={{ gap: 12 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: display, fontWeight: 700, fontSize: 18, color: T.pink, lineHeight: 1 }}>+{rupee(best.savingsYearly - curSaving)}</div>
                <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: T.faint, marginTop: 2 }}>more / yr</div>
              </div>
              <button onClick={() => document.getElementById("beat-verdict")?.scrollIntoView({ behavior: "smooth", block: "start" })} style={{ ...ctaBtn, fontSize: 12, padding: "8px 14px", whiteSpace: "nowrap" }}>See</button>
            </div>
          </>
        ) : (
          <div style={{ fontSize: 13.5, fontWeight: 600 }}>🎉 Your card is already the best on your spends.</div>
        )}
      </div>
    </div>
  );
}
