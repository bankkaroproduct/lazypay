"use client";

import { useRouter } from "next/navigation";
import type { Card } from "@/lib/publicCards";
import { CardObject } from "./CardObject";
import { LazyPayLogo } from "./Logo";
import { T, serif, display } from "./theme";

/** The LazyPay-style app home: a phone shell that hands off to the Ledger web. */
export default function AppShell({ cards }: { cards: Card[] }) {
  const router = useRouter();
  const trio = [cards[0], cards[3], cards[6]].filter(Boolean);

  const Tile = ({ title, sub, icon }: { title: string; sub: string; icon: string }) => (
    <div style={{ border: `1px solid ${T.line}`, borderRadius: 18, padding: 14, background: T.surface2 }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,30,126,0.10)", color: T.pink, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontWeight: 600, fontSize: 14 }}>{title}</div>
      <div style={{ fontSize: 11, color: T.mute, marginTop: 2 }}>{sub}</div>
    </div>
  );

  return (
    <div className="app-outer" style={{ background: T.bg, minHeight: "100vh", color: T.ink, fontFamily: "var(--font-body)", padding: "28px 16px 60px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
      <div className="app-phone" style={{ width: 390, maxWidth: "100%", height: 812, maxHeight: "88vh", background: T.surface, borderRadius: 46, border: `1px solid ${T.line}`, boxShadow: "0 60px 120px -40px rgba(20,10,25,0.25)", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div className="app-notch" style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", width: 120, height: 26, background: "#141018", borderRadius: 16, zIndex: 5 }} />

        <div className="no-scrollbar app-pscroll" style={{ flex: 1, overflowY: "auto", padding: "14px 20px 10px" }}>
          <div className="app-statusbar flex justify-between" style={{ fontSize: 12, color: T.mute, padding: "6px 4px 14px" }}>
            <span>9:41</span><span style={{ letterSpacing: 2 }}>● ▮ ⌁</span>
          </div>

          <div className="flex items-center justify-between" style={{ marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 12, color: T.mute, marginBottom: 4 }}>Good evening, Aditya</div>
              <LazyPayLogo height={24} />
            </div>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg, ${T.pink}, ${T.pinkDeep})`, color: T.onPink, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>A</div>
          </div>

          <div style={{ border: `1px solid ${T.line}`, borderRadius: 22, padding: "18px 20px", background: "linear-gradient(160deg, rgba(255,30,126,0.10), transparent 70%)", marginBottom: 16 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: T.pink }}>PayLater available</div>
            <div style={{ fontFamily: display, fontWeight: 700, fontSize: 34, margin: "4px 0 12px" }}>₹42,000</div>
            <div style={{ height: 5, borderRadius: 9, background: "rgba(20,10,25,0.06)", overflow: "hidden" }}><span style={{ display: "block", height: "100%", width: "64%", background: T.pink }} /></div>
            <div style={{ fontSize: 11, color: T.mute, marginTop: 8 }}>₹15,000 used of ₹57,000 · due 5 Oct</div>
          </div>

          <div className="grid grid-cols-2 gap-2.5" style={{ marginBottom: 22 }}>
            <Tile title="PayLater" sub="One-tap checkout" icon="⚡" />
            <Tile title="Gift Cards" sub="400+ brands" icon="▦" />
            <Tile title="Pay Bills" sub="Rent · utilities" icon="⌁" />
            <Tile title="Rewards" sub="₹1,240 saved" icon="✦" />
          </div>

          <div style={{ fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", color: T.faint, marginBottom: 10 }}>Credit cards</div>

          <div onClick={() => router.push("/cards")} style={{ border: `1px solid rgba(255,30,126,0.4)`, borderRadius: 24, padding: 22, background: T.surface, cursor: "pointer", position: "relative", overflow: "hidden" }}>
            <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: T.pink, marginBottom: 10 }}>Find your card</div>
            <div style={{ fontFamily: serif, fontSize: 26, lineHeight: 1.1 }}>The best credit<br />cards, <i style={{ color: T.pink }}>for you</i></div>
            <div style={{ fontSize: 12.5, color: T.mute, marginTop: 10, lineHeight: 1.5 }}>Tell us how you spend. We&apos;ll show the cards that save you the most money.</div>
            <div className="flex" style={{ margin: "18px 0 16px" }}>
              {trio.map((c, i) => (
                <div key={c.id} style={{ marginRight: -14, transform: `rotate(${i === 1 ? 2 : i === 0 ? -6 : 8}deg) translateY(${i === 1 ? -4 : 0}px)` }}>
                  <CardObject card={c} size="mini" />
                </div>
              ))}
            </div>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: T.pink, color: T.onPink, fontWeight: 700, fontSize: 14, padding: "11px 20px", borderRadius: 999 }}>
              See my cards <span>→</span>
            </span>
          </div>

          {/* Fixed-Deposit cards shortcut → opens the FD card listing */}
          <div
            onClick={(e) => { e.stopPropagation(); router.push("/cards?lens=fd"); }}
            className="flex items-center gap-3"
            style={{ marginTop: 12, border: `1px solid ${T.line}`, borderRadius: 18, padding: "14px 16px", background: T.surface2, cursor: "pointer" }}
          >
            <span style={{ fontSize: 26, flex: "none" }}>🏦</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Card on a Fixed Deposit</div>
              <div style={{ fontSize: 11.5, color: T.mute, marginTop: 1 }}>No credit score needed. Easy approval.</div>
            </div>
            <span style={{ color: T.pink, fontSize: 18 }}>→</span>
          </div>

          <div className="flex gap-2" style={{ marginTop: 12 }}>
            {[
              { l: "Card Genius", i: "✦", to: "/card-genius" },
              { l: "By Category", i: "◫", to: "/card-genius-category" },
              { l: "Beat My Card", i: "↗", to: "/beat-my-card" },
            ].map((q) => (
              <div key={q.to} onClick={() => router.push(q.to)} style={{ flex: 1, border: `1px solid ${T.line}`, borderRadius: 14, padding: "12px 8px", fontSize: 12, textAlign: "center", cursor: "pointer", color: T.ink }}>
                <span style={{ display: "block", color: T.pink, fontSize: 16, marginBottom: 5 }}>{q.i}</span>{q.l}
              </div>
            ))}
          </div>
        </div>

        <div className="app-tabbar flex" style={{ borderTop: `1px solid ${T.line}`, background: "rgba(255,255,255,0.97)" }}>
          {[
            { l: "Home", i: "⌂", on: true, to: "/" },
            { l: "Cards", i: "▦", on: false, to: "/cards" },
            { l: "Genius", i: "✦", on: false, to: "/card-genius" },
            { l: "Beat", i: "↗", on: false, to: "/beat-my-card" },
          ].map((t) => (
            <div key={t.l} onClick={() => router.push(t.to)} style={{ flex: 1, textAlign: "center", fontSize: 10, color: t.on ? T.pink : T.mute, padding: "10px 0", cursor: "pointer" }}>
              <span style={{ display: "block", fontSize: 18, marginBottom: 3 }}>{t.i}</span>{t.l}
            </div>
          ))}
        </div>
      </div>

      <div className="apphint" style={{ fontSize: 13, color: T.mute, textAlign: "center", maxWidth: 390 }}>
        Tap <b style={{ color: T.ink }}>“See my cards”</b> to find your best credit card.
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
        @media (max-width: 640px) {
          .app-outer { padding: 0 !important; display: block !important; }
          .app-phone { width: 100% !important; max-width: none !important; height: auto !important; min-height: 100vh !important; max-height: none !important; border: none !important; border-radius: 0 !important; box-shadow: none !important; }
          .app-notch, .app-statusbar, .apphint { display: none !important; }
          .app-pscroll { padding-bottom: 84px !important; }
          .app-tabbar { position: fixed !important; left: 0; right: 0; bottom: 0; z-index: 45; padding-bottom: env(safe-area-inset-bottom); }
        }
      `}</style>
    </div>
  );
}
