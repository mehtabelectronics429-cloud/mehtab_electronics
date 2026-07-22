/**
 * WhatsApp sending without the Meta Cloud API.
 *
 * Clicking "send" fires the WhatsApp deep link (`whatsapp://send?phone=…&text=…`)
 * which the OS hands straight to the installed WhatsApp app (desktop or mobile)
 * with the recipient + template message pre-filled  the operator just taps Send.
 * If the app isn't installed we fall back to wa.me (web), and if even that is
 * blocked we copy the link to the clipboard.
 */

/** Convert a wa.me / api.whatsapp.com URL into a native app deep link. */
export function toWhatsAppAppUrl(waUrl: string): string | null {
  try {
    const u = new URL(waUrl);
    const fromPath = u.pathname.replace(/\D/g, "");
    const phone =
      fromPath || (u.searchParams.get("phone") || "").replace(/\D/g, "");
    const text = u.searchParams.get("text") || "";
    const q = new URLSearchParams();
    if (phone) q.set("phone", phone);
    if (text) q.set("text", text);
    return `whatsapp://send?${q.toString()}`;
  } catch {
    return null;
  }
}

export function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    return navigator.clipboard
      .writeText(text)
      .then(() => true)
      .catch(() => false);
  }
  return Promise.resolve(false);
}

function fireDeepLink(url: string) {
  const a = document.createElement("a");
  a.href = url;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  window.setTimeout(() => a.remove(), 0);
}

/**
 * Open the recipient's chat in the native WhatsApp app with the message
 * pre-filled. `waUrl` is the wa.me link the API returns.
 */
export function openWhatsAppUrl(waUrl: string | null | undefined): boolean {
  if (!waUrl) return false;
  const appUrl = toWhatsAppAppUrl(waUrl);
  if (!appUrl) {
    void copyToClipboard(waUrl);
    return false;
  }

  // If the app doesn't grab focus shortly, fall back to wa.me (web).
  let handedOff = false;
  const onHide = () => {
    handedOff = true;
  };
  document.addEventListener("visibilitychange", onHide, { once: true });
  window.addEventListener("blur", onHide, { once: true });

  fireDeepLink(appUrl);

  window.setTimeout(() => {
    document.removeEventListener("visibilitychange", onHide);
    window.removeEventListener("blur", onHide);
    if (!handedOff && !document.hidden) {
      // App didn't open (likely not installed)  use WhatsApp Web as a fallback.
      const win = window.open(waUrl, "_blank");
      if (!win) void copyToClipboard(waUrl);
    }
  }, 1500);

  return true;
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
) {
  const fellBack =
    result.requestedChannel === "business" &&
    result.channel === "direct" &&
    !result.businessApiReady;

  if (result.channel === "direct" && result.waUrl) {
    openWhatsAppUrl(result.waUrl);
    if (fellBack) {
      return "Business API not configured  opening the WhatsApp app with the template. Tap Send.";
    }
    return "Opening the WhatsApp app with the message  tap Send to deliver.";
  }

  if (result.jobId) tickJobs?.();
  return "Queued for WhatsApp Business API.";
}
