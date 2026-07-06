import type { Metadata } from "next";
import Contact from "@/components/sections/Contact";
import AuroraBackground from "@/components/ui/AuroraBackground";

export const metadata: Metadata = {
  title: "Contact — Mehtab Electronics",
  description: "Book a free site survey for solar, security, smart home or networking. We reply within one business day.",
};

export default function ContactPage() {
  return (
    <main className="relative pt-24">
      <div className="relative overflow-hidden px-6 pb-4 pt-16 text-center md:px-8">
        <AuroraBackground />
        <span className="eyebrow">Get in touch</span>
        <h1 className="display-lg mx-auto mt-5 max-w-3xl text-fg">
          Let's build something <span className="text-gradient">powerful</span>.
        </h1>
        <p className="lead mx-auto mt-6 max-w-xl">
          Book a free site survey — our engineers design a system that fits your building and goals.
        </p>
      </div>
      <Contact showHeading={false} />
    </main>
  );
}
