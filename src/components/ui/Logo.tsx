import Link from "next/link";
import BrandMark from "@/components/ui/BrandMark";
import { cn } from "@/lib/utils";

/**
 * Brand lockup: the themed Mehtab mark (black artwork in light mode, white in
 * dark mode) next to the "MEHTAB ELECTRONICS" wordmark.
 */
export default function Logo({
  className,
  markSize = 40,
  wordmark = true,
}: {
  className?: string;
  markSize?: number;
  wordmark?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2.5", className)}
      aria-label="Mehtab Electronics  home"
    >
      <BrandMark size={markSize} priority />
      {wordmark && (
        <span className="font-display text-base uppercase leading-none tracking-wide text-fg">
          Mehtab <span className="text-brand">Electronics</span>
        </span>
      )}
    </Link>
  );
}
