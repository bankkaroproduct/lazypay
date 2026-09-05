"use client";

import { useMemo, useState, type MouseEvent as RMouseEvent } from "react";
import type { Card } from "@/lib/publicCards";
import { Link } from "@/components/Link";
import { redirectToCardApplication } from "@/utils/redirectHandler";
import { useComparison } from "@/contexts/ComparisonContext";
import { CompareBar } from "./CompareBar";
import { analytics } from "@/services/analytics";
import { getCardKey } from "@/utils/cardAlias";
import { topReward, rupee } from "@/lib/discoverEngine";
import { T, feeGst, cap, pill, ghostBtn, ctaBtn, applyBtn, compareBtn, serif, display } from "./theme";
import { CardObject, Stars } from "./CardObject";
import { Masthead } from "./Masthead";
import { BackPill } from "./BackPill";
import { DiscoverFooter } from "./DiscoverFooter";

const LENSES = [
  { key: "all", label: "All cards", alias: "" },
  { key: "fd", label: "FD cards", alias: "" },
  { key: "shopping", label: "Shopping", alias: "best-shopping-credit-card" },
  { key: "travel", label: "Travel", alias: "best-travel-credit-card" },
  { key: "dining", label: "Dining", alias: "best-dining-credit-card" },
  { key: "food", label: "Food delivery", alias: "online-food-ordering" },
  { key: "grocery", label: "Grocery", alias: "best-cards-grocery-shopping" },
  { key: "fuel", label: "Fuel", alias: "best-fuel-credit-card" },
  { key: "bills", label: "Bills & UPI", alias: "best-utility-credit-card" },
];

/** Curated Fixed-Deposit / secured cards (approval without a credit score). */
const FD_ALIASES = new Set([
  "idfc-first-wow-credit-card",
  "idfc-first-wow-black-credit-card",
  "sbi-unnati-credit-card",
  "jupiter-edge-credit-card",
  "yes-prosperity-reward-plus-credit-card",
  "paizabazaar-step-up-sbm-credit-card",
  "equitas-selfe-credit-card",
]);
const FD_KEYWORDS = ["wow", "unnati", "step-up", "step up", "selfe", "insta easy", "against fd", "secured"];
const isFDCard = (c: Card) =>
  FD_ALIASES.has(c.alias) ||
  FD_KEYWORDS.some((k) => c.name.toLowerCase().includes(k));
const FEE_OPTIONS = [
  { k: "all", label: "Any fee" }, { k: "free", label: "Lifetime free" },
  { k: "0-1000", label: "≤ ₹1,000" }, { k: "1000-2500", label: "₹1k–2.5k" },
  { k: "2500-5000", label: "₹2.5k–5k" }, { k: "5000+", label: "₹5k +" },
];
const NETWORKS = ["VISA", "Mastercard", "RuPay", "Amex"];
const GRID = "44px 1fr 108px 120px 120px 150px";

const matchesLens = (c: Card, key: string) => {
  if (key === "all") return true;
  if (key === "fd") return isFDCard(c);
  const names = c.tags.map((t) => t.name.toLowerCase());
  const needle: Record<string, string[]> = {
    shopping: ["shopping"], travel: ["travel"], dining: ["dining"], food: ["food"],
    grocery: ["grocery"], fuel: ["fuel"], bills: ["utility", "upi", "bill"],
  };
  return (needle[key] || []).some((k) => names.some((n) => n.includes(k)));
};
const matchesFee = (c: Card, k: string) => {
  if (k === "all") return true;
  if (k === "free") return (c.joiningFee ?? 0) === 0 && (c.annualFee ?? 0) === 0;
  const af = c.annualFee ?? 0;
  if (k === "5000+") return af >= 5000;
  const [lo, hi] = k.split("-").map(Number);
  return af >= lo && af <= hi;
};
const matchesNet = (c: Card, picked: string[]) =>
  !picked.length || picked.some((p) => c.networks.map((n) => n.toLowerCase()).includes(p.toLowerCase()));

export default function Ledger({ cards, initialLens }: { cards: Card[]; initialLens?: string }) {
  const [lensKey, setLensKey] = useState(() =>
    LENSES.some((l) => l.key === initialLens) ? (initialLens as string) : "all"
  );
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(14);
  const [hover, setHover] = useState<number | null>(null);
  const [feeK, setFeeK] = useState("all");
  const [nets, setNets] = useState<string[]>([]);
  const [refineOpen, setRefineOpen] = useState(false);
  const [income, setIncome] = useState("");
  const [salaryType, setSalaryType] = useState("");
  const [pincode, setPincode] = useState("");
  const [eligLPA, setEligLPA] = useState<number | null>(null);
  const [eligErr, setEligErr] = useState("");

  const { toggleCard, isSelected } = useComparison();
  const lens = LENSES.find((l) => l.key === lensKey)!;
  const activeRefine = (feeK !== "all" ? 1 : 0) + (nets.length ? 1 : 0);

  const rows = useMemo(() => {
    let out = cards.filter(
      (c) => matchesLens(c, lensKey) && matchesFee(c, feeK) && matchesNet(c, nets) &&
        (eligLPA == null || c.incomeLPA <= eligLPA)
    );
    if (query.trim()) {
      const q = query.toLowerCase();
      out = out.filter((c) =>
        c.name.toLowerCase().includes(q) || c.bank.toLowerCase().includes(q) ||
        c.networks.join(" ").toLowerCase().includes(q));
    }
    return out;
  }, [cards, lensKey, query, feeK, nets, eligLPA]);

  const visible = rows.slice(0, limit);
  const empty = cards.length === 0;

  const checkElig = () => {
    const v = Number(income);
    if (!v || v < 1000) { setEligErr("Enter a monthly income of ₹1,000 or more."); return; }
    if (!salaryType) { setEligErr("Tell us how you earn."); return; }
    if (!/^\d{6}$/.test(pincode)) { setEligErr("Enter your 6-digit pincode."); return; }
    setEligErr(""); setEligLPA((v * 12) / 100000); setLimit(14);
  };
  const clearElig = () => { setEligLPA(null); setIncome(""); setSalaryType(""); setPincode(""); setEligErr(""); };
  const focusFD = () => {
    setLensKey("fd"); setLimit(14);
    if (typeof document !== "undefined") document.getElementById("ledger-list")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const applyCard = (e: RMouseEvent, c: Card) => {
    e.preventDefault(); e.stopPropagation();
    analytics.trackCardAction("Apply Now", c.name);
    redirectToCardApplication(c.raw);
  };
  const compareCard = (e: RMouseEvent, c: Card) => {
    e.preventDefault(); e.stopPropagation();
    if (!isSelected(getCardKey(c.raw))) analytics.trackCardAction("Compare", c.name);
    toggleCard(c.raw);
  };

  return (
    <div style={{ background: T.bg, color: T.ink, minHeight: "100vh", fontFamily: "var(--font-body)" }}>
      <Masthead back={{ label: "Home", to: "/" }} />

      <main style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ paddingTop: 18 }}>
          <BackPill to="/" label="Back to app" />
        </div>
        {/* hero — centered */}
        <section className="ledger-hero" style={{ maxWidth: 780, margin: "0 auto", textAlign: "center", padding: "40px 0 52px" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.34em", textTransform: "uppercase", color: T.pink, marginBottom: 22 }}>
            Real ranks · no ads
          </div>
          <h1 style={{ fontFamily: serif, fontWeight: 500, lineHeight: 1.04, fontSize: "clamp(40px,6vw,72px)", letterSpacing: "-0.015em", margin: 0 }}>
            Find a card that{" "}
            <span style={{ fontStyle: "italic", color: T.pink }}>pays you</span> back.
          </h1>
          <p style={{ margin: "24px auto 0", maxWidth: 520, fontSize: 16.5, lineHeight: 1.6, color: T.mute }}>
            We rank every credit card in India by how much money it saves you. Tell us how you spend and we&apos;ll show your best ones.
          </p>
          <div className="flex items-center gap-2" style={{ margin: "30px auto 0", maxWidth: 440, borderBottom: `1px solid ${T.line}`, paddingBottom: 8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.pink} strokeWidth="1.6"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></svg>
            <input value={query} onChange={(e) => { setQuery(e.target.value); setLimit(14); }}
              placeholder="Search a card or bank…"
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: T.ink, fontSize: 15 }} />
          </div>
          <Link to="/card-genius" style={{ display: "inline-flex", margin: "22px auto 0", ...ghostBtn, textTransform: "none", letterSpacing: 0, fontSize: 13, color: T.pink, borderColor: "rgba(255,30,126,0.5)", textDecoration: "none" }}>
            ✦ Try Card Genius — get your best cards
          </Link>
          <div className="hero-stats flex items-center justify-center gap-4 flex-wrap" style={{ marginTop: 38, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: T.faint }}>
            <span><b style={{ color: T.ink, fontFamily: display }}>{cards.length || 230}</b> cards indexed</span>
            <span style={{ color: T.pink }}>/</span>
            <span><b style={{ color: T.ink, fontFamily: display }}>30+</b> banks</span>
            <span style={{ color: T.pink }}>/</span>
            <span>updated today</span>
          </div>
        </section>

        {/* Fixed-Deposit (secured) cards — front and centre */}
        <section style={{ marginBottom: 6 }}>
          <button
            onClick={focusFD}
            className="w-full flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 text-left"
            style={{
              border: `1px solid rgba(255,30,126,0.35)`, borderRadius: 20,
              background: "linear-gradient(100deg, rgba(255,30,126,0.10), rgba(255,30,126,0.03) 70%)",
              padding: "16px 18px", cursor: "pointer",
            }}
          >
            <div className="flex items-start gap-3" style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 26, lineHeight: 1.1, flex: "none" }}>🏦</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: serif, fontSize: 19, lineHeight: 1.2 }}>
                  No credit score? Get a card on your FD.
                </div>
                <div style={{ fontSize: 13, color: T.mute, marginTop: 3 }}>
                  Secured cards. Almost sure approval. No income proof.
                </div>
              </div>
            </div>
            <span className="w-full sm:w-auto" style={{ ...ctaBtn, flex: "none", whiteSpace: "nowrap", textAlign: "center" }}>See FD cards →</span>
          </button>
        </section>

        {/* lens nav */}
        <section style={{ borderTop: `1px solid ${T.line}`, paddingTop: 20 }}>
          <div style={{ ...cap }}>Pick what you spend on →</div>
          <div className="flex gap-6 mt-4 overflow-x-auto no-scrollbar" style={{ paddingBottom: 6 }}>
            {LENSES.map((l) => {
              const on = l.key === lensKey;
              return (
                <button key={l.key} onClick={() => { setLensKey(l.key); setLimit(14); }}
                  style={{ whiteSpace: "nowrap", fontSize: 15, color: on ? T.ink : T.mute, fontFamily: serif, fontStyle: on ? "italic" : "normal", paddingBottom: 8, borderBottom: `2px solid ${on ? T.pink : "transparent"}`, background: "none", cursor: "pointer" }}>
                  {l.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* eligibility + filters */}
        <section style={{ marginTop: 24 }}>
          <div style={{ borderTop: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}`, padding: "24px 4px", background: eligLPA != null ? "linear-gradient(180deg, rgba(255,30,126,0.06), transparent)" : "transparent" }}>
            {eligLPA != null ? (
              <div className="flex flex-col items-center text-center" style={{ gap: 10 }}>
                <div className="flex items-center" style={{ gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                  <span style={{ color: T.pink, fontSize: 18 }}>✦</span>
                  <span style={{ fontFamily: serif, fontStyle: "italic", fontSize: 18 }}>{rows.length} cards you can get</span>
                  <span style={{ fontSize: 12, color: T.mute }}>at ₹{Number(income).toLocaleString("en-IN")}/mo</span>
                </div>
                <button onClick={clearElig} style={ghostBtn}>Start over</button>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center" style={{ maxWidth: 560, margin: "0 auto" }}>
                <div style={{ fontFamily: serif, fontStyle: "italic", fontSize: 22 }}>Will you get approved?</div>
                <div style={{ fontSize: 13.5, color: T.mute, marginTop: 4 }}>
                  Three quick details. We only show cards you can actually get.
                </div>

                <div className="flex flex-wrap items-end justify-center" style={{ gap: 18, marginTop: 20 }}>
                  <label style={{ display: "block", textAlign: "left" }}>
                    <span style={{ ...cap, display: "block" }}>Monthly income ₹</span>
                    <input value={income} onChange={(e) => setIncome(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="80,000"
                      style={{ display: "block", marginTop: 6, width: 130, background: "transparent", border: "none", borderBottom: `1px solid ${T.line}`, outline: "none", color: T.ink, fontSize: 16, padding: "5px 0", fontFamily: display }} />
                  </label>
                  <label style={{ display: "block", textAlign: "left" }}>
                    <span style={{ ...cap, display: "block" }}>How you earn</span>
                    <select value={salaryType} onChange={(e) => setSalaryType(e.target.value)}
                      style={{ display: "block", marginTop: 6, width: 150, background: "transparent", border: "none", borderBottom: `1px solid ${T.line}`, outline: "none", color: salaryType ? T.ink : T.faint, fontSize: 15, padding: "6px 0", fontFamily: display, cursor: "pointer" }}>
                      <option value="" disabled>Select…</option>
                      <option value="salaried">Salaried</option>
                      <option value="self-employed">Self-employed</option>
                    </select>
                  </label>
                  <label style={{ display: "block", textAlign: "left" }}>
                    <span style={{ ...cap, display: "block" }}>Pincode</span>
                    <input value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" placeholder="400001"
                      style={{ display: "block", marginTop: 6, width: 110, background: "transparent", border: "none", borderBottom: `1px solid ${T.line}`, outline: "none", color: T.ink, fontSize: 16, padding: "5px 0", fontFamily: display }} />
                  </label>
                </div>

                <button onClick={checkElig} style={{ ...ctaBtn, marginTop: 22 }}>Show my cards →</button>
                {eligErr && <span style={{ fontSize: 12.5, color: "#D9455F", marginTop: 12 }}>{eligErr}</span>}
              </div>
            )}
          </div>
          <div className="flex items-center gap-5 flex-wrap" style={{ padding: "16px 4px 0" }}>
            <button onClick={() => setRefineOpen((o) => !o)} style={ghostBtn}>
              {refineOpen ? "− Filters" : "+ Filters"}{activeRefine > 0 && <span style={{ color: T.pink }}> · {activeRefine}</span>}
            </button>
            {activeRefine > 0 && (
              <button onClick={() => { setFeeK("all"); setNets([]); }} style={{ ...ghostBtn, border: "none", color: T.mute }}>Reset filters</button>
            )}
          </div>
          {refineOpen && (
            <div className="grid sm:grid-cols-[auto_1fr] gap-x-10 gap-y-5" style={{ padding: "18px 4px 4px" }}>
              <div>
                <div style={cap}>Annual fee</div>
                <div className="flex flex-wrap gap-2" style={{ marginTop: 10 }}>
                  {FEE_OPTIONS.map((f) => (
                    <button key={f.k} onClick={() => { setFeeK(f.k); setLimit(14); }} style={pill(feeK === f.k)}>{f.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <div style={cap}>Network</div>
                <div className="flex flex-wrap gap-2" style={{ marginTop: 10 }}>
                  {NETWORKS.map((n) => (
                    <button key={n} onClick={() => { setNets((p) => p.includes(n) ? p.filter((x) => x !== n) : [...p, n]); setLimit(14); }} style={pill(nets.includes(n))}>{n}</button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* the ledger */}
        <section id="ledger-list" style={{ paddingBottom: 100, scrollMarginTop: 70 }}>
          <div className="hidden md:grid items-center" style={{ gridTemplateColumns: GRID, gap: 16, padding: "18px 8px 12px", borderBottom: `1px solid ${T.line}`, fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: T.faint }}>
            <span>Rk</span><span>Card</span><span>Network</span><span>Join / Annual</span><span style={{ textAlign: "right" }}>Top reward</span><span />
          </div>

          {empty && <div style={{ padding: "60px 0", textAlign: "center", color: T.mute }}>Couldn&apos;t reach the card index. Refresh in a moment.</div>}
          {!empty && visible.length === 0 && <div style={{ padding: "60px 0", textAlign: "center", color: T.mute }}>No cards match “{query}”.</div>}

          {visible.map((c, i) => {
            const isHover = hover === c.id;
            const usp = c.usps[0];
            const selected = isSelected(getCardKey(c.raw));
            const tr = topReward(c);
            return (
              <Link key={c.id} to={`/cards/${c.alias}`} onClick={() => analytics.trackCardAction("View Details", c.name)}
                onMouseEnter={() => setHover(c.id)} onMouseLeave={() => setHover(null)}
                className="grid md:items-center ledger-row"
                style={{ gridTemplateColumns: "44px 1fr", gap: 16, padding: "20px 8px", borderBottom: `1px solid ${T.line}`, textDecoration: "none", color: T.ink, background: isHover ? "linear-gradient(90deg, rgba(255,30,126,0.05), transparent 70%)" : "transparent", transition: "background .25s" }}>
                <div style={{ fontFamily: display, fontWeight: 700, fontSize: 22, color: i < 3 ? T.pink : T.faint, lineHeight: 1, paddingTop: 2 }}>{String(i + 1).padStart(2, "0")}</div>
                <div className="md:contents">
                  <div className="hidden md:flex items-center gap-4 min-w-0">
                    <div style={{ transform: "rotate(-4deg)" }}><CardObject card={c} /></div>
                    <div className="min-w-0">
                      <div style={{ fontFamily: serif, fontSize: 18, lineHeight: 1.15, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{c.name}</div>
                      <div className="flex items-center gap-2" style={{ marginTop: 3, fontSize: 12, color: T.mute }}>
                        <span style={{ textTransform: "uppercase", letterSpacing: "0.1em" }}>{c.bank}</span>
                        {c.rating > 0 && <Stars value={c.rating} />}
                      </div>
                      <div className="md:hidden" style={{ marginTop: 8, fontSize: 12.5, color: T.mute }}>{usp?.header}</div>
                      <div className="hidden md:block" style={{ marginTop: 6, fontSize: 12.5, color: T.pink, maxHeight: isHover ? 20 : 0, opacity: isHover ? 1 : 0, overflow: "hidden", transition: "all .3s" }}>{usp?.header}</div>
                    </div>
                  </div>
                  <div className="hidden md:flex flex-wrap gap-1">
                    {c.networks.map((n) => (
                      <span key={n} style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: T.mute, border: `1px solid ${T.line}`, borderRadius: 4, padding: "3px 6px" }}>{n}</span>
                    ))}
                  </div>
                  <div className="hidden md:block" style={{ fontSize: 14 }}>
                    <span style={{ color: T.ink }}>{feeGst(c.joiningFee)}</span>
                    <span style={{ color: T.faint }}> / </span>
                    <span style={{ color: T.mute }}>{feeGst(c.annualFee)}</span>
                  </div>
                  <div className="hidden md:block" style={{ textAlign: "right" }}>
                    {tr.pct ? (
                      <><div style={{ fontFamily: display, fontWeight: 700, fontSize: 20, color: T.pink, lineHeight: 1 }}>{tr.pct}</div>
                        <div style={{ fontSize: 10.5, color: T.mute, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 5 }}>{tr.cat}</div></>
                    ) : <div style={{ fontSize: 10.5, color: T.mute, letterSpacing: "0.1em", textTransform: "uppercase" }}>{tr.cat}</div>}
                  </div>
                  <div className="hidden md:flex flex-col items-end gap-1.5">
                    <button onClick={(e) => applyCard(e, c)} style={applyBtn(isHover)}>Apply ↗</button>
                    <button onClick={(e) => compareCard(e, c)} style={compareBtn(selected)}>{selected ? "✓ Comparing" : "+ Compare"}</button>
                  </div>
                  {/* Mobile: one compact card row */}
                  <div className="md:hidden flex items-center" style={{ gap: 10, minWidth: 0 }}>
                    <CardObject card={c} size="xs" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: serif, fontSize: 14, lineHeight: 1.15, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{c.name}</div>
                      <div style={{ fontSize: 11.5, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {tr.pct
                          ? <span style={{ color: T.pink, fontWeight: 600 }}>{tr.pct} on {tr.cat}</span>
                          : <span style={{ color: T.mute }}>{c.bank} · {feeGst(c.annualFee)}/yr</span>}
                      </div>
                    </div>
                    <div className="flex items-center" style={{ gap: 6, flex: "none" }}>
                      <button onClick={(e) => compareCard(e, c)} aria-label="Compare"
                        style={{ width: 28, height: 28, borderRadius: "50%", border: `1px solid ${selected ? T.pink : T.line}`, color: selected ? T.pink : T.mute, background: "transparent", cursor: "pointer", fontSize: 14, lineHeight: 1, flex: "none" }}>
                        {selected ? "✓" : "+"}
                      </button>
                      <button onClick={(e) => applyCard(e, c)} style={{ ...applyBtn(true), padding: "6px 11px", fontSize: 12 }}>Apply</button>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}

          {!empty && limit < rows.length && (
            <div style={{ textAlign: "center", paddingTop: 34 }}>
              <button onClick={() => setLimit((l) => l + 14)} style={{ fontFamily: serif, fontStyle: "italic", fontSize: 16, color: T.ink, background: "transparent", border: `1px solid ${T.line}`, borderRadius: 999, padding: "12px 30px", cursor: "pointer" }}>
                Read {Math.min(14, rows.length - limit)} more ↓
              </button>
              <div style={{ marginTop: 12, ...cap }}>{limit} of {rows.length} in view</div>
            </div>
          )}
        </section>
      </main>

      <DiscoverFooter />

      <CompareBar cards={cards} />

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @media (min-width: 768px) {
          .ledger-row { grid-template-columns: ${GRID} !important; }
          .ledger-row > .md\\:contents { display: contents; }
        }
        @media (max-width: 640px) {
          .ledger-hero { padding: 34px 0 26px !important; }
          .ledger-hero h1 { font-size: 34px !important; line-height: 1.06 !important; }
          .ledger-hero p { font-size: 15px !important; margin-top: 16px !important; }
          .hero-stats { display: none !important; }
          .ledger-row { grid-template-columns: 30px minmax(0, 1fr) !important; gap: 10px !important; padding: 12px 6px !important; }
          .ledger-row > div:first-child { font-size: 16px !important; padding-top: 14px !important; }
        }
      `}</style>
    </div>
  );
}
