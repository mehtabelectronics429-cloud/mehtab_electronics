/** Open a direct WhatsApp (wa.me) link after the API returns it. */
export function openWhatsAppUrl(waUrl: string | null | undefined) {
  if (!waUrl) return false;
  window.open(waUrl, "_blank", "noopener,noreferrer");
  return true;
}

export type WhatsAppSendResult = {
  channel: "direct" | "business";
  requestedChannel?: "direct" | "business";
  waUrl?: string | null;
  jobId?: string | null;
  businessApiReady?: boolean;
};

export function toastForWhatsAppResult(result: WhatsAppSendResult, tickJobs?: () => void) {
  const fellBack =
    result.requestedChannel === "business" && result.channel === "direct" && !result.businessApiReady;

  if (result.channel === "direct" && result.waUrl) {
    openWhatsAppUrl(result.waUrl);
    if (fellBack) {
      return "Business API not configured yet — opened direct WhatsApp with the template. Tap Send.";
    }
    return "Opened WhatsApp with the template message — tap Send to deliver.";
  }

  if (result.jobId) tickJobs?.();
  return "Queued for WhatsApp Business API.";
}
