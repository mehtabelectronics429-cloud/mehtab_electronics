import Image from "next/image";
import Link from "next/link";
import { LOGO_MARK } from "@/lib/assets";
import { cn } from "@/lib/utils";

/**
 * Brand lockup: the Mehtab sun-elephant mark (white/gold artwork) sits in a
 * dark chip so it stays visible in both light and dark themes, next to the
 * "MEHTAB ELECTRONICS" wordmark.
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
    <Link href="/" className={cn("flex items-center gap-2.5", className)} aria-label="Mehtab Electronics — home">
      <span
        className="grid shrink-0 place-items-center overflow-hidden rounded-md bg-[#0c0c10] ring-1 ring-white/10"
        style={{ width: markSize, height: markSize }}
      >
        <Image
          src={LOGO_MARK}
          alt="Mehtab Electronics"
          width={210}
          height={178}
          className="h-[78%] w-[78%] object-contain"
          priority
        />
      </span>
      {wordmark && (
        <span className="font-display text-base uppercase leading-none tracking-wide text-fg">
          Mehtab <span className="text-brand">Electronics</span>
        </span>
      )}
    </Link>
  );
}
