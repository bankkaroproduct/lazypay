"use client";

import { T } from "./theme";

/**
 * LazyPay brand lockup: the layered pink play-mark + "LazyPay" wordmark.
 * Recreated as inline SVG so it stays crisp at any size and in any theme.
 * `mark` alone renders just the play-mark (for tight spaces / favicons).
 */
export function LazyPayLogo({
  height = 22,
  dark = false,
  markOnly = false,
}: {
  height?: number;
  dark?: boolean;
  markOnly?: boolean;
}) {
  const ink = dark ? "#FFFFFF" : "#1A1620";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: height * 0.4, lineHeight: 1 }}>
      <svg
        height={height}
        viewBox="0 0 52 48"
        fill="none"
        style={{ display: "block", flex: "none" }}
        aria-hidden="true"
      >
        {/* back triangle */}
        <path d="M4 4 L4 44 L38 24 Z" fill={ink} />
        {/* front play triangle (brand pink) */}
        <path d="M16 8 L16 40 L50 24 Z" fill={T.pink} />
      </svg>
      {!markOnly && (
        <span
          style={{
            fontFamily: "var(--font-body), system-ui, sans-serif",
            fontWeight: 800,
            fontSize: height * 0.9,
            letterSpacing: "-0.02em",
            color: ink,
          }}
        >
          Lazy<span style={{ color: T.pink }}>Pay</span>
        </span>
      )}
    </span>
  );
}
