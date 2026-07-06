import { COMPANY } from "./data";

/** Build a wa.me deep link with a prefilled, URL-encoded message. */
export function waLink(message: string, phone: string = COMPANY.whatsapp) {
  const num = phone.replace(/\D/g, "");
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}

/** Prefilled product inquiry message (dynamic per product). */
export function productInquiry(p: { name: string; category: string; model: string }) {
  const msg =
    `Hello,\n\nI am interested in the following product.\n\n` +
    `Product Name: ${p.name}\n` +
    `Category: ${p.category}\n` +
    `Model: ${p.model}\n\n` +
    `Please provide pricing and installation details.`;
  return waLink(msg);
}
