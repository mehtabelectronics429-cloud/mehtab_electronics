/**
 * WhatsApp sending without the Meta Cloud API.
 *
 * We can't deliver messages fully automatically without the official Business
 * API (and headless WhatsApp-Web automation violates WhatsApp's terms and can't
 * run on serverless). The in-between used here: open WhatsApp Web / the app in a
 * compact POPUP WINDOW (not a new browser tab) with the message pre-filled — the
 * operator just taps Send, staying inside the panel. If the popup is blocked, we
 * copy the link to the clipboard as a fallback.
 */

const POPUP_NAME = "mehtabWhatsApp";

function openCenteredPopup(url: string): Window | null {
  const w = 460;
  const h = 680;
  const dualLeft = typeof window.screenX === "number" ? window.screenX : 0;
  const dualTop = typeof window.screenY === "number" ? window.screenY : 0;
  const outerW = window.outerWidth || window.innerWidth || w;
  const outerH = window.outerHeight || window.innerHeight || h;
  const left = dualLeft + Math.max(0, (outerW - w) / 2);
  const top = dualTop + Math.max(0, (outerH - h) / 2);
  return window.open(
    url,
    POPUP_NAME,
    `popup=yes,noopener,noreferrer,width=${w},height=${h},left=${Math.round(left)},top=${Math.round(top)}`
  );
}

export function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  }
  return Promise.resolve(false);
}

/**
 * Pre-open a blank popup synchronously inside the click handler (before any
 * awaited fetch) so the browser keeps the user-gesture and doesn't block it.
 * Redirect it later with `sendPopupTo`.
 */
export function openBlankWhatsAppPopup(): Window | null {
  return openCenteredPopup("about:blank");
}

export function sendPopupTo(popup: Window | null, waUrl: string): boolean {
  if (popup && !popup.closed) {
    popup.location.href = waUrl;
    popup.focus();
    return true;
  }
  // popup was blocked / closed — try a fresh popup, else copy the link
  const fresh = openCenteredPopup(waUrl);
  if (fresh) {
    fresh.focus();
    return true;
  }
  void copyToClipboard(waUrl);
  return false;
}

/** Open a direct WhatsApp (wa.me) link in a popup window after the API returns it. */
export function openWhatsAppUrl(waUrl: string | null | undefined): boolean {
  if (!waUrl) return false;
  const popup = openCenteredPopup(waUrl);
  if (popup) {
    popup.focus();
    return true;
  }
  void copyToClipboard(waUrl);
  return false;
}

export type WhatsAppSendResult = {
  channel: "direct" | "business";
  requestedChannel?: "direct" | "business";
  waUrl?: string | null;
  jobId?: string | null;
  businessApiReady?: boolean;
};

export function toastForWhatsAppResult(
  result: WhatsAppSendResult,
  tickJobs?: () => void,
  /** optional pre-opened popup from the click handler (avoids blockers) */
  popup?: Window | null
) {
  const fellBack =
    result.requestedChannel === "business" && result.channel === "direct" && !result.businessApiReady;

  if (result.channel === "direct" && result.waUrl) {
    const opened = popup !== undefined ? sendPopupTo(popup, result.waUrl) : openWhatsAppUrl(result.waUrl);
    if (!opened) {
      return "Popup blocked — the WhatsApp link was copied. Paste it to send.";
    }
    if (fellBack) {
      return "Business API not configured — opened a WhatsApp popup with the template. Tap Send.";
    }
    return "Opened a WhatsApp popup with the message — tap Send to deliver.";
  }

  if (popup && !popup.closed) popup.close();
  if (result.jobId) tickJobs?.();
  return "Queued for WhatsApp Business API.";
}
