import { authManager } from "@/services/authManager";

/**
 * BankKaro Journey Track (JT). Events go through /api/journey-track, which
 * forwards them with the partner-token; JT resolves the partner from the token.
 * Event names follow the other partner sites so JT reports line up.
 */

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = sessionStorage.getItem("bk_session_id");
    if (!id) {
      id = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem("bk_session_id", id);
    }
    return id;
  } catch {
    return "";
  }
}

function getDeviceType(): string {
  if (typeof window === "undefined") return "";
  return window.innerWidth < 768 ? "mobile" : window.innerWidth < 1024 ? "tablet" : "desktop";
}

async function sendJourneyEvent(event_name: string, metadata: Record<string, unknown> = {}): Promise<void> {
  try {
    let token = "";
    try { token = await authManager.getToken(); } catch { /* send without token */ }

    await fetch("/api/journey-track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "partner-token": token } : {}),
      },
      body: JSON.stringify({ event_name, session_id: getSessionId(), device_type: getDeviceType(), metadata }),
      // Survives the page navigating away (apply_redirect fires right before we leave).
      keepalive: true,
    });
  } catch {
    // Never let tracking break the app
  }
}

export const trackJourneyEvent = sendJourneyEvent;

// --- FD flow: lead step ---
export const trackLeadPageView = () => sendJourneyEvent("fd_lead_page_view");
export const trackLeadSubmitted = (name: string, mobile: string) =>
  sendJourneyEvent("fd_lead_submitted", { name, mobile });
export const trackLeadValidationFailed = (field: string, reason: string) =>
  sendJourneyEvent("fd_lead_validation_failed", { field, reason });

// --- FD flow: card list ---
export const trackFDListView = (cardsCount: number) => sendJourneyEvent("fd_cards_page_view", { cards_count: cardsCount });
export const trackCardClicked = (cardAlias: string, cardName: string, bank: string, position: number) =>
  sendJourneyEvent("card_clicked", { card_alias: cardAlias, card_name: cardName, bank, position });
export const trackListingApplyNowClicked = (cardAlias: string, source: string) =>
  sendJourneyEvent("listing_apply_now_clicked", { card_alias: cardAlias, source });

// --- Card details ---
export const trackCardDetailsPageView = (cardAlias: string, cardName: string, bank: string, source: string) =>
  sendJourneyEvent("card_details_page_view", { card_alias: cardAlias, card_name: cardName, bank, source });
export const trackCardDetailsBackClicked = (cardAlias: string) =>
  sendJourneyEvent("card_details_back_clicked", { card_alias: cardAlias });
export const trackCardDetailsApplyNowClicked = (cardAlias: string, cardName: string) =>
  sendJourneyEvent("card_details_apply_now_clicked", { card_alias: cardAlias, card_name: cardName });

// --- Redirect: carries the exit_id from get-link so JT can tie the exit to the bank application ---
export const trackApplyRedirect = (cardAlias: string, source: string, exitId: string | null) =>
  sendJourneyEvent("apply_redirect", { card_alias: cardAlias, source, exit_id: exitId });
