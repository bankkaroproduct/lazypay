/** The name + mobile captured on the FD flow's first step, kept per browser tab. */
export type Lead = { name: string; phone: string };

const LEAD_KEY = "lp_lead";

export function loadLead(): Lead | null {
  try {
    const saved = sessionStorage.getItem(LEAD_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null; // storage blocked
  }
}

export function storeLead(l: Lead | null) {
  try {
    if (l) sessionStorage.setItem(LEAD_KEY, JSON.stringify(l));
    else sessionStorage.removeItem(LEAD_KEY);
  } catch { /* ignore */ }
}

/**
 * Add the lead to a partner tracking link as p2=<name>_<number>. Partner links
 * come as `p1={click_id}&p2={user_id}`: p2 takes the lead and p1 is left empty
 * (as the other partner sites send it) — get-link rejects the raw braces.
 */
export function withLeadParam(url: string, lead: Lead | null): string {
  if (!lead) return url;
  try {
    const u = new URL(url.trim().replace("{click_id}", ""));
    u.searchParams.set("p2", `${lead.name}_${lead.phone}`);
    return u.toString();
  } catch {
    return url; // no/invalid URL — let the redirect handler report it
  }
}
