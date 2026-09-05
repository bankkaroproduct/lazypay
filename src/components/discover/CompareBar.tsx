"use client";

import type React from "react";
import { useState } from "react";
import type { Card } from "@/lib/publicCards";
import { useComparison } from "@/contexts/ComparisonContext";
import { getCardKey } from "@/utils/cardAlias";
import { redirectToCardApplication } from "@/utils/redirectHandler";
import { topReward } from "@/lib/discoverEngine";
import { T, feeGst, ctaBtn, serif, display, cap } from "./theme";
import { CardObject } from "./CardObject";

/**
 * Pink, mobile-first compare experience. Replaces the old desktop-only pill.
 * Shows a bottom bar when cards are selected, and a full side-by-side sheet.
 */
export function CompareBar({ cards }: { cards: Card[] }) {
  const { selectedCards, removeCard, clearAll } = useComparison();
  const [open, setOpen] = useState(false);

  if (!selectedCards.length) return null;

  // Match each selected raw card back to the full Card for rich fields.
  const byAlias = new Map(cards.map((c) => [c.alias, c]));
  const picked: Card[] = selectedCards.map((raw: any) => {
    const alias = raw.seo_card_alias || raw.card_alias;
    return (
      byAlias.get(alias) ||
      ({
        id: raw.id, name: raw.name || raw.card_name, bank: raw.banks?.name || "",
        alias, networks: String(raw.card_type || "").split(",").map((s: string) => s.trim()).filter(Boolean),
        image: raw.image || raw.card_bg_image || "", gradient: raw.card_bg_gradient || "#eee",
        rating: 0, joiningFee: raw.joining_fee_text ? Number(String(raw.joining_fee_text).replace(/[^0-9]/g, "")) : null,
        annualFee: raw.annual_fee_text ? Number(String(raw.annual_fee_text).replace(/[^0-9]/g, "")) : null,
        minIncome: "—", minScore: "—", usps: [], tags: [], rates: {}, raw, applyUrl: raw.network_url || "#",
      } as unknown as Card)
    );
  });

  const remove = (c: Card) => removeCard(getCardKey(c.raw ?? c));

  return (
    <>
      <style>{`@media (max-width: 1023px){ .compare-fab{ bottom: calc(18px + env(safe-area-inset-bottom)) !important; } }`}</style>
      {/* bottom bar (mobile + desktop) */}
      <div
        className="compare-fab"
        style={{
          position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: 18, zIndex: 55,
          background: "rgba(255,255,255,0.97)", border: `1px solid rgba(255,30,126,0.4)`,
          borderRadius: 999, boxShadow: "0 20px 50px -20px rgba(20,10,25,0.3)", backdropFilter: "blur(10px)",
          display: "flex", alignItems: "center", gap: 12, padding: "9px 10px 9px 18px", maxWidth: "92vw",
        }}
      >
        <span style={{ fontSize: 13, whiteSpace: "nowrap" }}>
          {selectedCards.length} card{selectedCards.length > 1 ? "s" : ""} to compare
        </span>
        <button onClick={() => setOpen(true)} style={{ ...ctaBtn, fontSize: 13, padding: "8px 16px", whiteSpace: "nowrap" }}>
          Compare →
        </button>
        <button onClick={clearAll} aria-label="Clear"
          style={{ background: "transparent", border: `1px solid ${T.line}`, color: T.mute, width: 30, height: 30, borderRadius: "50%", cursor: "pointer", flex: "none" }}>
          ✕
        </button>
      </div>

      {/* full-screen compare sheet */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 70, background: "rgba(26,22,32,0.45)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: T.bg, width: "100%", maxWidth: 920, maxHeight: "92vh", borderRadius: "22px 22px 0 0", overflow: "hidden", display: "flex", flexDirection: "column" }}
          >
            <div className="flex items-center justify-between" style={{ padding: "16px 20px", borderBottom: `1px solid ${T.line}` }}>
              <span style={{ fontFamily: serif, fontStyle: "italic", fontSize: 20 }}>Side by side</span>
              <button onClick={() => setOpen(false)} style={{ background: "transparent", border: `1px solid ${T.line}`, color: T.ink, borderRadius: 999, padding: "6px 14px", fontSize: 13, cursor: "pointer" }}>Done</button>
            </div>

            <div style={{ overflow: "auto", padding: "8px 16px 24px" }}>
              <table style={{ borderCollapse: "collapse", width: "100%", minWidth: picked.length * 160 + 120 }}>
                <tbody>
                  <tr>
                    <td style={tdLabel} />
                    {picked.map((c) => (
                      <td key={c.alias} style={{ ...td, textAlign: "center" }}>
                        <button onClick={() => remove(c)} style={{ float: "right", background: "transparent", border: `1px solid ${T.line}`, color: T.mute, width: 22, height: 22, borderRadius: "50%", fontSize: 11, cursor: "pointer" }}>✕</button>
                        <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}><CardObject card={c} size="sm" /></div>
                        <div style={{ fontFamily: serif, fontSize: 15, marginTop: 10, lineHeight: 1.2 }}>{c.name}</div>
                      </td>
                    ))}
                  </tr>
                  {ROWS.map((r) => (
                    <tr key={r.label}>
                      <td style={tdLabel}>{r.label}</td>
                      {picked.map((c) => (
                        <td key={c.alias} style={{ ...td, ...r.style }}>{r.get(c)}</td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <td style={tdLabel} />
                    {picked.map((c) => (
                      <td key={c.alias} style={td}>
                        <button onClick={() => redirectToCardApplication(c.raw ?? c)} style={{ ...ctaBtn, fontSize: 12, padding: "8px 14px", width: "100%" }}>Apply ↗</button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const td: React.CSSProperties = { border: `1px solid ${T.line}`, padding: "12px 14px", verticalAlign: "top", fontSize: 14, background: T.surface };
const tdLabel: React.CSSProperties = { ...cap, border: `1px solid ${T.line}`, padding: "12px 14px", width: 110, background: T.surface2 };

const ROWS: { label: string; get: (c: Card) => React.ReactNode; style?: React.CSSProperties }[] = [
  { label: "Bank", get: (c) => c.bank },
  { label: "Networks", get: (c) => c.networks.join(" · ") },
  { label: "Joining", get: (c) => feeGst(c.joiningFee), style: { fontFamily: display, fontWeight: 700 } },
  { label: "Annual", get: (c) => feeGst(c.annualFee), style: { fontFamily: display, fontWeight: 700 } },
  {
    label: "Top reward",
    get: (c) => {
      const t = topReward(c);
      return t.pct ? `${t.pct} ${t.cat}` : "General";
    },
    style: { color: T.pink, fontWeight: 600 },
  },
  { label: "Min income", get: (c) => c.minIncome },
  { label: "Min score", get: (c) => c.minScore },
];
