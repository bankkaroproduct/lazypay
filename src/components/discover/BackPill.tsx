"use client";

import { Link } from "@/components/Link";
import { T } from "./theme";

/** Back navigation as a pill, placed in the page body (the tinted area) below the header. */
export function BackPill({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        fontSize: 13, color: T.ink, textDecoration: "none",
        border: `1px solid ${T.line}`, background: T.surface,
        borderRadius: 999, padding: "8px 16px", whiteSpace: "nowrap",
      }}
    >
      <span style={{ color: T.pink, fontSize: 15, lineHeight: 1 }}>‹</span> {label}
    </Link>
  );
}
