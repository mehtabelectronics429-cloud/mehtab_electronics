"use client";

import { MessageCircle } from "lucide-react";
import { waLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

export default function WhatsAppButton({
  message,
  href,
  label = "Inquire on WhatsApp",
  className,
  variant = "solid",
}: {
  message?: string;
  href?: string;
  label?: string;
  className?: string;
  variant?: "solid" | "ghost";
}) {
  const link = href ?? waLink(message ?? "Hello, I'd like to know more about your products and services.");
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "sheen group inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-transform duration-300 hover:scale-[1.03]",
        variant === "solid"
          ? "bg-[#25D366] text-[#052e16] shadow-[0_0_40px_-12px_rgba(37,211,102,0.8)]"
          : "glass hairline text-fg hover:border-[#25D366]/50",
        className
      )}
    >
      <MessageCircle className="h-4 w-4" />
      {label}
    </a>
  );
}
