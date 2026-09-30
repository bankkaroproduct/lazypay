"use client";

import { useEffect, useState, type FormEvent, type MouseEvent } from "react";
import type { Card } from "@/lib/publicCards";
import { redirectToCardApplication } from "@/utils/redirectHandler";
import { analytics } from "@/services/analytics";
import { cleanName, normalizePhone, validateName, validatePhone } from "@/lib/leadValidation";
import { type Lead, loadLead, storeLead, withLeadParam } from "@/lib/lead";
import { Link } from "@/components/Link";
import { rupee } from "@/lib/discoverEngine";
import { trackLeadPageView, trackLeadSubmitted, trackFDListView, trackCardClicked, trackListingApplyNowClicked } from "@/services/journeyTrack";
import { CardObject } from "./CardObject";
import { LazyPayLogo } from "./Logo";
import { T, serif, display, cap, ctaBtn, applyBtn, feeGst } from "./theme";

/** Step 1: name + mobile. Step 2: the Fixed-Deposit card list. */
export default function FDFlow({ cards }: { cards: Card[] }) {
  const [lead, setLead] = useState<Lead | null>(null);

  // Per-tab convenience: a refresh keeps the user on the card list.
  useEffect(() => { setLead(loadLead()); }, []);

  const saveLead = (l: Lead | null) => {
    setLead(l);
    storeLead(l);
  };

  return (
    <div className="fd-outer" style={{ background: T.bg, minHeight: "100vh", color: T.ink, fontFamily: "var(--font-body)", padding: "28px 16px 60px", display: "flex", justifyContent: "center" }}>
      <div className="fd-phone" style={{ width: 390, maxWidth: "100%", height: 812, maxHeight: "92vh", background: T.surface, borderRadius: 46, border: `1px solid ${T.line}`, boxShadow: "0 60px 120px -40px rgba(20,10,25,0.25)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div className="no-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "28px 22px 24px" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 26 }}>
            <LazyPayLogo height={24} />
            {lead && (
              <button onClick={() => saveLead(null)} style={{ fontSize: 12, color: T.mute, background: "none", border: "none", cursor: "pointer" }}>
                Edit details
              </button>
            )}
          </div>
          {lead ? <FDList cards={cards} lead={lead} /> : <LeadForm onDone={saveLead} />}
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
        @media (max-width: 640px) {
          .fd-outer { padding: 0 !important; display: block !important; }
          .fd-phone { width: 100% !important; height: auto !important; min-height: 100vh !important; max-height: none !important; border: none !important; border-radius: 0 !important; box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}

function LeadForm({ onDone }: { onDone: (l: Lead) => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [touched, setTouched] = useState({ name: false, phone: false });

  useEffect(() => { trackLeadPageView(); }, []);

  const nameErr = validateName(name);
  const phoneErr = validatePhone(phone);
  const showName = touched.name && nameErr;
  const showPhone = touched.phone && phoneErr;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, phone: true });
    if (nameErr || phoneErr) return;
    analytics.trackEvent({ category: "Lead", action: "Submit", label: "FD flow" });
    const lead = { name: cleanName(name), phone: normalizePhone(phone) };
    trackLeadSubmitted(lead.name, lead.phone);
    onDone(lead);
  };

  const field = (err: string | false) => ({
    display: "flex", alignItems: "center", gap: 10, marginTop: 8,
    border: `1px solid ${err ? "#D9455F" : T.line}`, borderRadius: 14,
    padding: "13px 14px", background: T.surface2,
  });
  const input = { flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none", color: T.ink, fontSize: 16, fontFamily: display };
  const errText = { fontSize: 12, color: "#D9455F", marginTop: 6 };

  return (
    <form onSubmit={submit} noValidate>
      <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: T.pink }}>Card on a Fixed Deposit</div>
      <h1 style={{ fontFamily: serif, fontWeight: 500, fontSize: 30, lineHeight: 1.1, margin: "8px 0 10px" }}>
        No credit score? <i style={{ color: T.pink }}>No problem.</i>
      </h1>
      <p style={{ fontSize: 13.5, color: T.mute, lineHeight: 1.55, margin: "0 0 26px" }}>
        Get a credit card backed by your FD. Almost sure approval, no income proof. Tell us who you are to see your cards.
      </p>

      <label style={{ display: "block" }}>
        <span style={cap}>Full name</span>
        <div style={field(showName)}>
          <input value={name} onChange={(e) => setName(e.target.value)} onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            placeholder="As on your PAN" autoComplete="name" maxLength={50} style={input} />
        </div>
        {showName && <div style={errText}>{nameErr}</div>}
      </label>

      <label style={{ display: "block", marginTop: 18 }}>
        <span style={cap}>Mobile number</span>
        <div style={field(showPhone)}>
          <span style={{ color: T.mute, fontFamily: display, fontSize: 16 }}>+91</span>
          <span style={{ width: 1, alignSelf: "stretch", background: T.line }} />
          <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^\d\s+-]/g, "").slice(0, 16))}
            onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
            placeholder="10-digit mobile" inputMode="numeric" autoComplete="tel-national" style={input} />
        </div>
        {showPhone && <div style={errText}>{phoneErr}</div>}
      </label>

      <button type="submit" style={{ ...ctaBtn, width: "100%", marginTop: 26, padding: "14px 22px", fontSize: 15 }}>
        Show my FD cards →
      </button>
      <p style={{ fontSize: 11, color: T.faint, lineHeight: 1.5, marginTop: 14, textAlign: "center" }}>
        By continuing you agree to be contacted about card offers on this number.
      </p>
    </form>
  );
}

function FDList({ cards, lead }: { cards: Card[]; lead: Lead }) {
  const first = lead.name.split(" ")[0];

  useEffect(() => { trackFDListView(cards.length); }, [cards.length]);

  const apply = (e: MouseEvent, c: Card) => {
    e.preventDefault(); e.stopPropagation();
    analytics.trackCardAction("Apply Now", c.name);
    trackListingApplyNowClicked(c.alias, "fd_list");
    redirectToCardApplication(c.raw, { networkUrl: withLeadParam(c.raw.network_url, lead), source: "fd_list" });
  };

  return (
    <div>
      <div style={{ fontSize: 12, color: T.mute }}>Hi {first},</div>
      <h1 style={{ fontFamily: serif, fontWeight: 500, fontSize: 26, lineHeight: 1.15, margin: "4px 0 6px" }}>
        {cards.length} cards you can get <i style={{ color: T.pink }}>on your FD</i>
      </h1>
      <p style={{ fontSize: 13, color: T.mute, margin: "0 0 20px" }}>Your credit limit is set against your deposit, which keeps earning interest.</p>

      {cards.length === 0 && (
        <div style={{ padding: "40px 0", textAlign: "center", color: T.mute, fontSize: 14 }}>
          Couldn&apos;t reach the card index. Refresh in a moment.
        </div>
      )}

      <div className="flex flex-col" style={{ gap: 12 }}>
        {cards.map((c, i) => (
          <Link key={c.id} to={`/cards/${c.alias}?from=fd`}
            onClick={() => { analytics.trackCardAction("View Details", c.name); trackCardClicked(c.alias, c.name, c.bank, i + 1); }}
            style={{ display: "block", border: `1px solid ${T.line}`, borderRadius: 18, padding: 14, background: T.surface, color: T.ink, textDecoration: "none" }}>
            <div className="flex items-center" style={{ gap: 12 }}>
              <CardObject card={c} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: serif, fontSize: 15.5, lineHeight: 1.2 }}>{c.name.trim()}</div>
                <div style={{ fontSize: 11, color: T.mute, marginTop: 3, textTransform: "uppercase", letterSpacing: "0.08em" }}>{c.bank}</div>
                <div style={{ display: "inline-block", marginTop: 6, fontSize: 11.5, fontWeight: 600, color: T.pink, background: "rgba(255,30,126,0.08)", borderRadius: 999, padding: "3px 9px" }}>
                  {c.minFD != null ? `Min FD ${rupee(c.minFD)}` : "Min FD: Not Specified"}
                </div>
              </div>
              <span style={{ color: T.faint, fontSize: 20, lineHeight: 1 }}>›</span>
            </div>
            {c.usps[0] && <div style={{ fontSize: 12.5, color: T.ink, marginTop: 10, lineHeight: 1.4 }}>✦ {c.usps[0].header.trim()}</div>}
            <div className="flex items-center justify-between" style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, color: T.mute }}>
                Joining <b style={{ color: T.ink }}>{feeGst(c.joiningFee)}</b> · Annual <b style={{ color: T.ink }}>{feeGst(c.annualFee)}</b>
              </div>
              <button onClick={(e) => apply(e, c)} style={applyBtn(true)}>Apply ↗</button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
