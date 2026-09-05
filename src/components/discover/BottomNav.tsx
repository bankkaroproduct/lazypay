"use client";

import { usePathname, useRouter } from "next/navigation";
import { T } from "./theme";

const TABS = [
  { label: "Home", icon: "⌂", to: "/" },
  { label: "Cards", icon: "▦", to: "/cards" },
  { label: "Genius", icon: "✦", to: "/card-genius" },
  { label: "Category", icon: "◫", to: "/card-genius-category" },
  { label: "Beat", icon: "↗", to: "/beat-my-card" },
];

/** App-style bottom tab bar for the web screens (mobile only). */
export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (to: string) =>
    to === "/cards" ? pathname.startsWith("/cards") : pathname === to;

  return (
    <nav
      className="bottom-nav"
      style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 45,
        display: "flex", borderTop: `1px solid ${T.line}`,
        background: "rgba(255,255,255,0.97)", backdropFilter: "blur(12px)",
      }}
    >
      {TABS.map((t) => {
        const on = isActive(t.to);
        return (
          <button
            key={t.to}
            onClick={() => router.push(t.to)}
            style={{
              flex: 1, textAlign: "center", background: "transparent", border: "none",
              cursor: "pointer", padding: "9px 0 max(9px, env(safe-area-inset-bottom))",
              color: on ? T.pink : T.mute, fontFamily: "var(--font-body)",
            }}
          >
            <span style={{ display: "block", fontSize: 19, lineHeight: 1, marginBottom: 3 }}>{t.icon}</span>
            <span style={{ fontSize: 10.5, letterSpacing: "0.02em" }}>{t.label}</span>
          </button>
        );
      })}
      <style>{`@media (min-width: 1024px){ .bottom-nav{ display:none !important; } }`}</style>
    </nav>
  );
}
