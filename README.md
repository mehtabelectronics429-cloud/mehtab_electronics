# Mehtab Electronics Smart Energy & Security Showroom

A world-class, cinematic 3D website for an Electronics & Smart-Energy company
(CCTV, home/office security, solar, hybrid & on-grid systems, inverters, UPS,
batteries, smart-home automation, electric fencing, networking, and AMC).

Built with the **UI/UX Pro Max** design system (Premium Dark / Aurora Glass),
tuned for an Apple × Tesla × Nothing × DJI showroom feel.

## ✦ What's new (v2)

- **Multi-page site** dedicated routes, each with its own hero, 3D particle accent and section flow: `/` (home), `/solar`, `/security`, `/smart-home`, `/projects`, `/about`, `/contact`.
- **Dark + Light mode** premium dark by default, a polished light theme, an animated navbar toggle, a no-flash boot script, and the choice is remembered. Colours are semantic CSS-variable tokens (`bg`, `surface`, `fg`, `muted`, `line`) so both themes stay consistent. The immersive 3D story stays a dark cinematic "stage" in both themes.
- **More 3D particles** a reusable WebGL `ParticleField` (dual-swarm, mouse-parallax) behind every page hero, plus denser particles in the cinematic scene.
- **New sections** extra scroll-driven cinematic `SceneStrip`s, a `Process` timeline with a scroll-filling rail, animated `Stats` counters, a `Team` grid with spring 3D `TiltCard`s, and `Packages` pricing.
- **Refreshed typography** tighter display tracking plus new `display-md`, `lead` and `kicker` styles.

> **Dev vs build:** `npm run dev` is the fast way to view it. A full `next build` bundles Three.js and is CPU/RAM-heavy give it a minute or two on a real machine (it verified clean via `tsc` and full route compilation).

---

## ✦ Cinematic upgrade (v3)

Layered onto the existing project (no content, components or routes removed):

- **Postprocessing bloom + vignette** (`@react-three/postprocessing`) on the dark 3D stages (`three/Effects.tsx`) emissive materials now glow like Apple/Tesla renders.
- **GPU shader particles** (`three/ShaderParticles.tsx`) custom GLSL points that react to mouse (repulsion), scroll and time; used as `ParticlesBG` behind the hero. GPU-only, additive, 60fps-friendly.
- **New interactive 3D scene Energy Network globe** (`three/EnergyGlobe.tsx` → `sections/EnergyNetwork.tsx`): point-cloud globe with animated energy arcs, travelling pulses, bloom and mouse-parallax orbit. Added to Home and Smart Home.
- **Horizontal-scroll product gallery** (`sections/ProductGallery.tsx`) a pinned, scroll-linked sideways gallery (Apple-AirPods style).
- **Cinematic scroll** global `ScrollProgress` bar, a route-transition `template.tsx` (blur-in + light sweep), and richer `AuroraBackground` (volumetric light rays + starfield).
- **Premium glassy micro-interactions** reusable CSS utilities: rotating `animated-border`, `glow-pulse`, hover `sheen`, `moving-gradient`, `text-shimmer` (applied to hero chips, service and project cards; `GlassCard` gained a `glow` prop).

## ✦ Premium electronics upgrade (v4)

Extended the existing project (nothing removed, routing intact):

- **Products catalogue + WhatsApp inquiry** new `/products` route with a category filter (Solar Panels, Inverters, Batteries, Security Cameras, CCTV Packages, Biometrics, Smart Locks, Intercoms, Networking, Accessories) and premium `ProductCard`s (glass, 3D tilt, animated border, glow, hover zoom). Every card has an **"Inquire on WhatsApp"** button that opens WhatsApp pre-filled with the product name, category and model (`lib/whatsapp.ts`). A **Featured Products** strip links to it from the home page.
- **Cinematic video background** `VideoBackground` renders a darkened, noise-textured full-screen loop in dark mode (drop your clip at `public/videos/hero-bg.mp4`). Falls back to the animated aurora on mobile / reduced-motion / when no video is present.
- **New sections** `WhyUs`, `IndustriesServed`, `Brands` (marquee), `Newsletter`/CTA, plus `Timeline` and `Values` on About.
- **New `/services` page** glass bento + feature rows + process + packages + why-us.
- **Nav / footer / contact** navbar gains Products & Services links + hide-on-scroll; footer gains socials, a category column and a newsletter; contact gains quick Call / WhatsApp actions and an animated map marker.

New routes added: `/products`, `/services` (existing routes untouched).

## ✦ Exploded-view experiences (v5)

Two Apple-keynote-style, scroll-pinned "travel inside the product" sections (no existing content changed):

- **Solar Inverter** after the hero on `/solar`. A 440vh (mobile) / 660vh (desktop) pinned section: the inverter floats in, six outer panels explode apart, the camera flies inside, and ten interior components (motherboard, fans, copper coil, transformer, capacitors, battery terminals, display, heat sink, wiring, MPPT controller) light up one by one with a floating glass spec card, then it reassembles with a CTA.
- **AI Security Camera** after the hero on `/security`. Same choreography through the lens: the glass dome and bezel explode forward, the camera enters the barrel, and ten parts (lens elements, CMOS, IR LEDs, AI chip, night-vision, mic, speaker, heat sink, WiFi, power) are revealed with labels.

Both reuse the design system, `SceneEffects` bloom, dust particles and glass cards, and share one reusable `ExplodedExperience` wrapper + a scroll to phase mapper (`explodePhase`) so the 3D camera/glow and DOM info-cards stay in sync. Scenes are dynamic (ssr:false), with a progress rail, step dots and scroll hint; heights and particle counts scale down on mobile.

## ✦ Real part imagery (v6)

The exploded-view scenes now use **actual photographs** instead of abstract blocks:

- The product is shown whole, then on scroll it **breaks apart** the shell panels explode outward while the camera simultaneously **flies inside** and travels through the interior. Each inner part is fixed in place and **brightens/blooms** as the camera passes its depth. Parts are **borderless real photos** (no frame they read as the actual part), loaded via `three/ImagePlane.tsx` with a graceful dark fallback.
- The **closed product** shows the real inverter / camera photo on its exterior, which slides away and fades as the shell explodes.
- The floating info card also shows the part photo thumbnail.
- Image URLs live in `lib/data.ts` (`INVERTER_PART_IMAGES`, `CAMERA_PART_IMAGES`, `INVERTER_IMAGE`, `CAMERA_IMAGE`) swap any for your own product photos. Textures load with crossOrigin for CORS-friendly hosts (Unsplash works out of the box).

## ✦ Tech stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS** custom dark/aurora design tokens
- **React Three Fiber + Three.js + drei** the 6-scene cinematic 3D story
- **GSAP** (`quickTo`, ScrollTrigger) magnetic buttons & scroll sync
- **Framer Motion** reveals, tabs, accordion, parallax
- **Lenis** smooth inertia scrolling
- **lucide-react** icons

## ✦ Getting started

```bash
# from this folder
# (if a partial node_modules exists from transfer, remove it first)
rm -rf node_modules            # optional, recommended for a clean install
npm install
npm run dev                    # http://localhost:3000
```

Build for production:

```bash
npm run build && npm start
```

> **Fonts** are loaded at runtime via Google Fonts `<link>` (Syncopate / Space
> Grotesk / Space Mono), so the build never blocks on network access. To
> self-host instead, swap `src/app/layout.tsx` back to `next/font/google`.

## ✦ The cinematic 3D story (6 scenes)

Driven entirely by scroll (`useScroll` → progress → Three.js `useFrame`) inside
one pinned, sticky canvas (`src/components/sections/CinematicStory.tsx`):

1. **The Structure** a smart house appears, edge-lit.
2. **Vision** AI security cameras orbit, laser scan cones sweep.
3. **Harvest** solar panels rise from the ground and tilt to the sun.
4. **Storage** glowing energy beams flow into the lithium battery.
5. **Conversion** the hybrid inverter powers up with a live screen pulse.
6. **The Living System** windows blaze, a cyan energy shield forms around the home.

The 3D scene is `dynamic()`-imported (`ssr:false`) so Three.js is fully code-split
and lazy-loaded. `AdaptiveDpr`/`AdaptiveEvents` + fog keep it near 60fps.

## ✦ Folder structure

```
src/
├── app/
│   ├── layout.tsx          # fonts, metadata, providers
│   ├── page.tsx            # section composition
│   └── globals.css         # design tokens + utility layers
├── lib/
│   ├── data.ts             # all content (services, projects, FAQs, testimonials…)
│   ├── utils.ts            # cn(), Unsplash image helper
│   └── three-utils.ts      # smoothstep/lerp/colours
├── components/
│   ├── providers/
│   │   └── SmoothScroll.tsx        # Lenis + GSAP ticker
│   ├── ui/                         # reusable primitives
│   │   ├── MagneticButton.tsx      # elastic.out quickTo magnetism
│   │   ├── CursorGlow.tsx          # custom cursor + hover ring
│   │   ├── GlassCard, Reveal, SectionHeading, SmartImage, Icon,
│   │   │   AuroraBackground, Particles, FeatureRow
│   ├── three/
│   │   ├── models.tsx              # house, cameras, solar, power core, beams, shield, particles
│   │   └── ShowroomScene.tsx       # camera rig + lights + scene director
│   └── sections/                   # all 14+ page sections
├── design-system/
│   └── MASTER.md           # UI/UX Pro Max design system (source of truth)
```

## ✦ Sections

Navbar · Hero (3D-adjacent) · Cinematic 6-scene Story · About · Services (bento) ·
CCTV · Solar · Inverters · Smart Home · Projects · Before/After (interactive slider) ·
Interactive Product Showcase · Technology · Testimonials · FAQ · Contact (form) · Footer.

## ✦ Interactions

Smooth inertia scroll · parallax · mouse-depth camera movement · cursor glow ·
magnetic buttons · glass hover lift · floating particles · aurora gradients ·
scroll-scrubbed 3D · animated before/after slider · spring-physics tab pill.
All motion respects `prefers-reduced-motion`.

## ✦ Images

Premium royalty-free photography from Unsplash, loaded client-side via `SmartImage`,
which sits every photo over a graphite→electric gradient so the layout stays
intentional even if a remote image is slow or unavailable. Swap any URL in
`src/lib/data.ts`.

## ✦ Notes

- `next.config.mjs` sets `images.unoptimized` + Unsplash `remotePatterns`.
- Verified with `next build` compiles cleanly, types valid, static export of `/`.
- Content (phone, email, address in `src/lib/data.ts` → `COMPANY`) uses realistic
  placeholder details for Mehtab Electronics (Lahore, Pakistan) edit to taste.
