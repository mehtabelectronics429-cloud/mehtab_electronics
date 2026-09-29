import Image from "next/image";
import { LOGO_MARK, LOGO_MARK_BLACK } from "@/lib/assets";
import { cn } from "@/lib/utils";

/**
 * The Mehtab logo, themed: black artwork on light backgrounds, white artwork
 * in dark mode (`.dark` on <html>). Both render so the swap is pure CSS and
 * never flashes the wrong variant before hydration.
 */
export default function BrandMark({
  size = 40,
  className,
  priority = false,
}: {
  /** Height in px; width follows the logo's aspect ratio. */
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  const width = Math.round((size * 770) / 666);
  const common = { alt: "Mehtab Electronics", width: 770, height: 666, priority };
  return (
    <span
      className={cn("relative block shrink-0", className)}
      style={{ width, height: size }}
    >
      <Image {...common} src={LOGO_MARK_BLACK} className="h-full w-full object-contain dark:hidden" />
      <Image {...common} src={LOGO_MARK} alt="" aria-hidden className="hidden h-full w-full object-contain dark:block" />
    </span>
  );
}
