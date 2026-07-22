# Mehtab Electronics Design System (MASTER)

> Generated with **UI/UX Pro Max** design intelligence, tuned to a Premium-Dark /
> Aurora-Glass brief (variance 8, motion 9). Source of truth for all pages.

## Pattern

**Immersive / Interactive Experience** a scroll-driven cinematic showroom.
Full-screen 3D hero → guided 6-scene product story → benefit sections → CTA.
Always provide a _Skip / mobile fallback_ and a reduced-motion path.

## Style

Fusion of **Modern Dark (Cinematic)** + **Gradient Mesh / Aurora** + **Glassmorphism**

- **Bento Grids**. Apple / Tesla / Nothing / DJI product-showroom energy.

* No pure `#000000` (OLED smear). Base is `#04060B`.
* Frosted-glass cards, hairline borders `rgba(255,255,255,0.08–0.12)`.
* Large blurred glowing light blobs, volumetric bloom, soft reflections.

## Color Tokens

| Token         | Hex       | Use                          |
| ------------- | --------- | ---------------------------- |
| Void          | `#04060B` | Page base                    |
| Obsidian      | `#080B12` | Sections                     |
| Graphite      | `#12161F` | Cards                        |
| Steel         | `#1B2130` | Elevated surfaces            |
| Chrome Silver | `#C7CDD6` | Metallic text / borders      |
| Electric Blue | `#2E6BFF` | Primary                      |
| Cyan          | `#22E0FF` | Accent / glow                |
| Solar Orange  | `#FF8A34` | Energy accent (solar)        |
| Energy Green  | `#38F6A4` | Energy accent (power/eco)    |
| Foreground    | `#E7ECF3` | Body text (contrast ≥ 4.5:1) |

## Typography

- **Display:** Syncopate 700 kinetic, wide, futuristic (huge cinematic headlines).
- **Body:** Space Grotesk clean geometric grotesque, 16px+ base, line-height 1.6.
- **Mono / eyebrow / data:** Space Mono uppercase labels, spec readouts, tabular numbers.

## Motion (tier: Complex)

- Smooth inertia scroll (Lenis), GSAP ScrollTrigger scrub for the 3D story.
- Magnetic buttons: `elastic.out(1,0.4)`, `gsap.quickTo`, offset ×0.3.
- Reveals: `y:40 → 0`, `opacity 0 → 1`, stagger 30–50ms, ease-out-expo.
- Parallax on decorative layers only (yPercent 5–15). Never on body copy.
- Respect `prefers-reduced-motion`; pin at most 1–2 sections.

## Effects

Aurora mesh gradients, cursor glow, depth-of-field bloom on 3D, glass hover lift
(translateY -6px + cyan border), light reflections, floating particles.

## Sections

Navbar · Hero (3D) · Cinematic 6-scene Story · About · Services · Camera ·
Solar · Inverters · Smart Home · Projects · Before/After · Product Showcase ·
Technology · Testimonials · FAQ · Contact · Footer.

## Anti-patterns to avoid

Emoji as icons · boring fade-only animations · gray-on-gray text ·
pure-black backgrounds · pinning many sections · parallaxing text ·
placeholder/lorem content.
