import Image from "next/image";
import Link from "next/link";
import { SECURITY_BANNER } from "@/lib/assets";

/**
 * Full-width branded banner (Solar EPC + Security Division). The artwork already
 * carries its own headline and "Request your site survey" CTA, so we show it
 * as-is and make the whole thing a link to Contact  no text overlay.
 */
export default function PromoBanner() {
  return (
    <section className="relative py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <Link
          href="/contact"
          aria-label="Mehtab Electronics & Security Division  request your site survey"
          className="group block overflow-hidden rounded-lg border border-line/15 shadow-card transition-shadow duration-300 hover:shadow-card-lg"
        >
          <Image
            src={SECURITY_BANNER}
            alt="Mehtab Electronics & Security Division  Solar EPC and professional CCTV systems"
            width={1147}
            height={484}
            sizes="(max-width: 1280px) 100vw, 1200px"
            className="h-auto w-full transition-transform duration-700 group-hover:scale-[1.02]"
            priority={false}
          />
        </Link>
      </div>
    </section>
  );
}
