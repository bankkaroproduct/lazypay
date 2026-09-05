import type { CSSProperties } from "react";

/* LazyPay white / pink palette (matches the app brand). */
export const T = {
  bg: "#FFF6FA",       // page
  surface: "#FFFFFF",  // cards
  surface2: "#FFF4F8", // tinted panels
  ink: "#1A1620",      // primary text
  mute: "#6E6675",     // secondary text
  faint: "#AEA6B4",    // labels
  line: "#EFE3EC",     // dividers
  pink: "#FF1E7E",     // accent
  pinkDeep: "#C71862",
  onPink: "#FFFFFF",
} as const;

export const feeGst = (base: number | null): string => {
  if (base == null || base === 0) return "Free";
  return "₹" + Math.round(base * 1.18).toLocaleString("en-IN");
};

/* ── shared control styles ─────────────────────────────────────────────── */
export const cap: CSSProperties = {
  fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: T.faint,
};
export const pill = (on: boolean): CSSProperties => ({
  fontSize: 13, letterSpacing: "0.01em", borderRadius: 999, padding: "8px 15px",
  cursor: "pointer", transition: "all .18s", fontFamily: "var(--font-body), sans-serif",
  border: `1px solid ${on ? T.pink : T.line}`,
  color: on ? T.onPink : T.mute, background: on ? T.pink : "transparent",
});
export const ghostBtn: CSSProperties = {
  fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: T.ink,
  background: "transparent", border: `1px solid ${T.line}`, borderRadius: 999,
  padding: "7px 15px", cursor: "pointer", fontFamily: "var(--font-body), sans-serif",
};
export const ctaBtn: CSSProperties = {
  fontSize: 13, letterSpacing: "0.06em", color: T.onPink, background: T.pink,
  border: `1px solid ${T.pink}`, borderRadius: 999, padding: "10px 22px",
  cursor: "pointer", fontWeight: 600, fontFamily: "var(--font-body), sans-serif",
};
export const applyBtn = (active: boolean): CSSProperties => ({
  fontSize: 12, letterSpacing: "0.06em", color: active ? T.onPink : T.ink,
  background: active ? T.pink : "transparent",
  border: `1px solid ${active ? T.pink : T.line}`, borderRadius: 999,
  padding: "6px 14px", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap",
  fontFamily: "var(--font-body), sans-serif", transition: "all .18s",
});
export const compareBtn = (on: boolean): CSSProperties => ({
  fontSize: 11, letterSpacing: "0.04em", color: on ? T.pink : T.mute,
  background: "transparent", border: `1px solid ${on ? T.pink : T.line}`,
  borderRadius: 999, padding: "5px 12px", cursor: "pointer", whiteSpace: "nowrap",
  fontFamily: "var(--font-body), sans-serif", transition: "all .18s",
});

export const serif = "var(--font-playfair), Georgia, serif";
export const display = "var(--font-display), sans-serif";
export const body = "var(--font-body), sans-serif";
