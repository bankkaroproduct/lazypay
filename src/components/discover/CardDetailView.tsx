"use client";

import type { Card, CardDetails } from "@/lib/publicCards";
import { T, feeGst, serif, display, cap } from "./theme";
import { topReward, rupee } from "@/lib/discoverEngine";
import { CardObject, Stars } from "./CardObject";
import { Masthead } from "./Masthead";
import { BackPill } from "./BackPill";
import { DiscoverFooter } from "./DiscoverFooter";
import { useComparison } from "@/contexts/ComparisonContext";
import { getCardKey } from "@/utils/cardAlias";
import { redirectToCardApplication } from "@/utils/redirectHandler";
import { Link } from "@/components/Link";
import { loadLead, withLeadParam } from "@/lib/lead";
import { analytics } from "@/services/analytics";
import { trackCardDetailsPageView, trackCardDetailsBackClicked, trackCardDetailsApplyNowClicked } from "@/services/journeyTrack";
import { useEffect } from "react";

/**
 * `fd` = opened from the FD flow: only links back to it (no nav, Card Genius,
 * Compare or footer links to the parked screens), and Apply carries the lead as p2.
 */
export default function CardDetailView({ card, details, fd = false }: { card: Card; details: CardDetails | null; fd?: boolean }) {
  const { toggleCard, isSelected } = useComparison();
  const tr = topReward(card);
  const selected = isSelected(getCardKey(card.raw));

  // The feed repeats USPs; show each once.
  const usps = card.usps.filter((u, i, all) =>
    u.header.trim() && all.findIndex((x) => x.header.trim().toLowerCase() === u.header.trim().toLowerCase()) === i);
  const minFD = card.minFD != null ? rupee(card.minFD) : null;

  useEffect(() => {
    trackCardDetailsPageView(card.alias, card.name, card.bank, fd ? "fd_list" : "direct");
  }, [card.alias, card.name, card.bank, fd]);

  const apply = () => {
    analytics.trackCardAction("Apply Now", card.name);
    trackCardDetailsApplyNowClicked(card.alias, card.name);
    if (fd) redirectToCardApplication(card.raw, { networkUrl: withLeadParam(card.raw.network_url, loadLead()), source: "card_details" });
    else redirectToCardApplication(card.raw, { source: "card_details" });
  };

  return (
    <div
      style={{
        background: T.bg,
        color: T.ink,
        minHeight: "100vh",
        fontFamily: "var(--font-body)",
      }}
    >
      {fd ? <Masthead showNav={false} homeTo="/" /> : <Masthead />}

      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 24px 120px" }}>
        <div style={{ marginBottom: 24 }}>
          <span onClick={() => trackCardDetailsBackClicked(card.alias)}>
            {fd ? <BackPill to="/" label="FD cards" /> : <BackPill to="/cards" label="All cards" />}
          </span>
        </div>

        {card.isFD && (
          <section
            style={{
              border: "1px solid rgba(255,30,126,0.35)", borderRadius: 22,
              background: "linear-gradient(110deg, rgba(255,30,126,0.12), rgba(255,30,126,0.03) 70%)",
              padding: "22px 24px", marginBottom: 36,
            }}
          >
            <div style={{ ...cap, color: T.pink }}>Minimum Fixed Deposit</div>
            <div style={{ fontFamily: display, fontWeight: 700, fontSize: minFD ? "clamp(38px,6vw,54px)" : 26, lineHeight: 1.05, marginTop: 6 }}>
              {minFD ?? "Not Specified"}
            </div>
            {minFD && (
              <div style={{ fontSize: 13.5, color: T.mute, marginTop: 8, lineHeight: 1.5 }}>
                Open an FD of {minFD} or more with {card.bank} to get this card. Your credit limit is set against the deposit, which keeps earning interest.
              </div>
            )}
          </section>
        )}
        {/* Top area */}
        <div className="grid grid-cols-1 md:grid-cols-[360px_minmax(0,1fr)] items-start" style={{ gap: 48 }}>
          {/* LEFT */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                top: -14,
                left: -14,
                background: T.pink,
                color: T.onPink,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                padding: "5px 10px",
                borderRadius: 999,
                zIndex: 2,
              }}
            >
              Top pick
            </div>
            <CardObject card={card} size="hero" />
          </div>

          {/* RIGHT */}
          <div>
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: T.pink,
                marginBottom: 14,
              }}
            >
              {card.bank} · Credit card
            </div>
            <h1
              style={{
                fontFamily: serif,
                fontSize: "clamp(30px,4vw,46px)",
                lineHeight: 1.05,
                margin: 0,
              }}
            >
              {card.name}
            </h1>

            <div
              className="flex items-center"
              style={{ gap: 12, marginTop: 12, color: T.mute, fontSize: 13 }}
            >
              {card.rating > 0 && <Stars value={card.rating} />}
              <span>We ranked it for you</span>
            </div>

            <div className="flex" style={{ gap: 6, marginTop: 16 }}>
              {card.networks.map((n) => (
                <span
                  key={n}
                  style={{
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: T.mute,
                    border: `1px solid ${T.line}`,
                    borderRadius: 4,
                    padding: "3px 6px",
                  }}
                >
                  {n}
                </span>
              ))}
            </div>

            {/* Stats grid */}
            <div
              className={fd ? "grid grid-cols-2" : "grid grid-cols-2 sm:grid-cols-3"}
              style={{
                gap: 1,
                background: T.line,
                border: `1px solid ${T.line}`,
                borderRadius: 16,
                overflow: "hidden",
                margin: "36px 0",
              }}
            >
              <StatCell label="Joining (incl GST)" value={feeGst(card.joiningFee)} />
              <StatCell label="Annual (incl GST)" value={feeGst(card.annualFee)} />
              <StatCell label="Top reward">
                <span style={{ color: T.pink }}>
                  {tr.pct || "—"}
                  <span style={{ fontSize: 13, color: T.mute }}> {tr.cat}</span>
                </span>
              </StatCell>
              {/* FD cards are approved against the deposit; the feed's income/score values contradict that. */}
              {!fd && <StatCell label="Min income" value={card.minIncome} />}
              {!fd && <StatCell label="Min credit score" value={card.minScore} />}
              <StatCell label="Networks">
                <span style={{ fontSize: 15 }}>{card.networks.join(" · ")}</span>
              </StatCell>
            </div>

            {!fd && <Link
              to="/card-genius"
              style={{
                border: "1px solid rgba(255,30,126,0.5)",
                color: T.pink,
                borderRadius: 999,
                padding: "11px 20px",
                fontSize: 13,
                display: "inline-flex",
                background: "transparent",
                textDecoration: "none",
              }}
            >
              See how much this card saves you →
            </Link>}
          </div>
        </div>

        {/* Why we picked it */}
        <h2
          style={{
            fontFamily: serif,
            fontStyle: "italic",
            fontSize: 22,
            margin: "36px 0 18px",
          }}
        >
          Why we picked it
        </h2>
        {usps.map((usp, i) => (
          <div
            key={i}
            className="flex"
            style={{ gap: 14, padding: "16px 0", borderTop: `1px solid ${T.line}` }}
          >
            <span
              style={{
                fontFamily: display,
                color: T.pink,
                fontWeight: 700,
                fontSize: 14,
                width: 26,
                flex: "none",
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{usp.header}</div>
              {usp.description && (
                <div
                  style={{
                    fontSize: 13,
                    color: T.mute,
                    marginTop: 4,
                    lineHeight: 1.5,
                  }}
                >
                  {usp.description}
                </div>
              )}
            </div>
          </div>
        ))}

        {details && <DetailSections card={card} details={details} fd={fd} />}

        {/* Tags */}
        <div className="flex flex-wrap" style={{ gap: 8, marginTop: 26 }}>
          {card.tags.map((tag, i) => (
            <span
              key={i}
              style={{
                fontSize: 12,
                color: T.mute,
                border: `1px solid ${T.line}`,
                borderRadius: 999,
                padding: "6px 14px",
              }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      </main>

      {!fd && <DiscoverFooter />}

      {/* Sticky bottom bar */}
      <div
        className="flex items-center justify-between detail-applybar"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 46,
          borderTop: `1px solid ${T.line}`,
          background: "rgba(255,255,255,0.94)",
          backdropFilter: "blur(12px)",
          padding: "14px 20px",
          paddingBottom: "calc(14px + env(safe-area-inset-bottom))",
          gap: 16,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: T.faint,
            }}
          >
            {card.isFD ? "Minimum FD" : "Top reward"}
          </div>
          <div style={{ fontFamily: display, fontWeight: 700, fontSize: 20, color: T.pink, whiteSpace: "nowrap" }}>
            {card.isFD ? (minFD ?? "Not Specified") : <>
              {tr.pct || "—"}
              <span style={{ fontSize: 13, color: T.mute }}> {tr.cat}</span>
            </>}
          </div>
        </div>

        <div className="flex items-center" style={{ gap: 8, flex: "none" }}>
          {!fd && <button
            type="button"
            onClick={() => toggleCard(card.raw)}
            aria-label="Compare"
            style={{
              background: "transparent",
              border: `1px solid ${selected ? T.pink : T.line}`,
              color: selected ? T.pink : T.ink,
              borderRadius: 999,
              padding: "9px 15px",
              fontSize: 13,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {selected ? "✓" : "+ Compare"}
          </button>}
          <button
            type="button"
            onClick={apply}
            style={{
              background: T.pink,
              color: T.onPink,
              border: "none",
              fontWeight: 700,
              fontSize: 14.5,
              padding: "11px 22px",
              borderRadius: 999,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Apply ↗
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCell({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div style={{ background: T.surface, padding: "18px 16px" }}>
      <div
        style={{
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: T.faint,
        }}
      >
        {label}
      </div>
      <div style={{ fontFamily: display, fontWeight: 700, fontSize: 22, marginTop: 6 }}>
        {children ?? value}
      </div>
    </div>
  );
}

const h2: React.CSSProperties = { fontFamily: serif, fontStyle: "italic", fontSize: 22, margin: "40px 0 14px" };
const row: React.CSSProperties = { padding: "14px 0", borderTop: `1px solid ${T.line}` };
const note: React.CSSProperties = { fontSize: 13, color: T.mute, marginTop: 4, lineHeight: 1.55 };

/** Fees, rewards, eligibility, exclusions, T&C and FAQs — only the parts the feed actually has. */
function DetailSections({ card, details: d, fd }: { card: Card; details: CardDetails; fd: boolean }) {
  // FD cards don't need a credit score; the feed's score copy contradicts that.
  const eligibility = fd ? d.eligibility.filter((e) => e.label !== "Credit score") : d.eligibility;

  return (
    <>
      <h2 style={h2}>Fees</h2>
      <div style={row}>
        <div className="flex justify-between" style={{ gap: 12 }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>Joining fee</span>
          <span style={{ fontFamily: display, fontWeight: 700 }}>{feeGst(card.joiningFee)}</span>
        </div>
        {d.joiningFeeNote.map((n, i) => <div key={i} style={note}>{n}</div>)}
      </div>
      <div style={row}>
        <div className="flex justify-between" style={{ gap: 12 }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>Annual fee</span>
          <span style={{ fontFamily: display, fontWeight: 700 }}>{feeGst(card.annualFee)}</span>
        </div>
        {d.annualFeeNote.map((n, i) => <div key={i} style={note}>{n}</div>)}
      </div>
      <div style={{ fontSize: 11.5, color: T.faint, marginTop: 6 }}>Fees shown include 18% GST.</div>

      {(d.rewardRate || d.redemption.length > 0) && (
        <>
          <h2 style={h2}>Rewards</h2>
          {d.rewardRate && (
            <div style={row}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>Reward value</div>
              <div style={note}>{d.rewardRate}</div>
            </div>
          )}
          {d.redemption.length > 0 && (
            <div style={row}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>Redeem for</div>
              <ul style={{ ...note, paddingLeft: 18, listStyle: "disc" }}>
                {d.redemption.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
              {d.catalogueUrl && (
                <a href={d.catalogueUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: 8, fontSize: 13, color: T.pink }}>
                  View rewards catalogue ↗
                </a>
              )}
            </div>
          )}
        </>
      )}

      {eligibility.length > 0 && (
        <>
          <h2 style={h2}>Eligibility</h2>
          {eligibility.map((e) => (
            <div key={e.label} className="grid sm:grid-cols-[160px_1fr]" style={{ ...row, gap: 4 }}>
              <span style={{ fontWeight: 600, fontSize: 15 }}>{e.label}</span>
              <span style={{ fontSize: 14, color: T.mute, lineHeight: 1.55 }}>{e.value}</span>
            </div>
          ))}
        </>
      )}

      {d.exclusions.length > 0 && (
        <>
          <h2 style={h2}>No rewards on</h2>
          <div className="flex flex-wrap" style={{ gap: 8 }}>
            {d.exclusions.map((x) => (
              <span key={x} style={{ fontSize: 12.5, color: T.mute, border: `1px solid ${T.line}`, borderRadius: 999, padding: "6px 12px" }}>{x}</span>
            ))}
          </div>
        </>
      )}

      {d.tnc && (
        <>
          <h2 style={h2}>Terms</h2>
          <p style={{ fontSize: 13.5, color: T.mute, lineHeight: 1.6, margin: 0 }}>{d.tnc}</p>
        </>
      )}

      {d.faqs.length > 0 && (
        <>
          <h2 style={h2}>Questions people ask</h2>
          {d.faqs.map((g) => (
            <details key={g.topic} style={{ borderTop: `1px solid ${T.line}` }}>
              <summary style={{ cursor: "pointer", padding: "16px 0", fontWeight: 600, fontSize: 15 }}>
                {g.topic} <span style={{ color: T.faint, fontWeight: 400 }}>· {g.items.length}</span>
              </summary>
              {g.items.map((f, i) => (
                <div key={i} style={{ padding: "0 0 14px 14px", borderLeft: `2px solid ${T.line}`, marginBottom: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{f.q}</div>
                  <div style={note}>{f.a}</div>
                </div>
              ))}
            </details>
          ))}
        </>
      )}
    </>
  );
}
