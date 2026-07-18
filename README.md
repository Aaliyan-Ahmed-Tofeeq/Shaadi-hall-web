# Mehrab Hall — Luxury Wedding Hall Website

A complete, dependency-free static website for a luxury wedding venue: hero, about,
services, packages, availability calendar, booking form, gallery with lightbox,
décor themes, catering menu, animated stats, testimonials slider, team, FAQ
accordion, map, contact, and footer — fully responsive from 320px to 2560px+,
with accessibility, SEO, PWA basics, and a Decap CMS scaffold.

## Quick start

Because the booking form and calendar use `fetch`/relative paths for CMS content,
serve the folder over HTTP rather than opening `index.html` directly (double-clicking
still works for browsing, but the JSON content-loader and service worker need a server):

```bash
cd wedding-hall
python3 -m http.server 8080
# visit http://localhost:8080
```

Any static host works: Netlify, Vercel, GitHub Pages, S3+CloudFront, etc.

## What's real and working

- **All 20+ sections** from the brief, fully built (not wireframes).
- **Responsive**: mobile-first CSS using `clamp()`, fluid grids, and dedicated
  breakpoint rules in `css/responsive.css` for 320–2560px+, tested logic for
  no horizontal scroll, 44px+ touch targets, and no overlap.
- **Working interactions**: mobile nav with focus trap-friendly close behavior,
  sticky glass nav, scroll progress bar, back-to-top, loading screen, scroll-reveal
  animations, animated counters, gallery filter + keyboard-accessible lightbox,
  tabbed catering menu, accordion FAQ, testimonial slider (swipe-free, dot + arrow
  controls), a real JS-driven availability calendar (sample booked dates — wire
  to a real backend for production), and a validated booking form.
- **Booking flow**: since there's no backend in this deliverable, "Send" opens a
  pre-filled WhatsApp chat (`js/main.js`, `WHATSAPP_NUMBER` constant) — a common,
  zero-infrastructure pattern for venues. Swap in a real POST endpoint if you have
  a CRM/email service.
- **Accessibility**: semantic landmarks, skip link, visible focus states, alt text
  everywhere, ARIA on toggles/accordions/dialogs, keyboard-operable gallery and
  calendar, `prefers-reduced-motion` respected.
- **SEO**: title/description/canonical, Open Graph + Twitter cards, Schema.org
  `EventVenue` JSON-LD, `robots.txt`, `sitemap.xml`.
- **PWA basics**: `manifest.json`, a real caching `sw.js` (network-first for pages,
  cache-first for assets), `offline.html` fallback, generated icons in `/icons`.
- **CMS scaffold**: `admin/config.yml` defines Decap CMS collections for every
  section requested (hero, about, services, packages, gallery, testimonials, FAQs,
  menu, contact, SEO), backed by seed JSON in `/content`. `js/content-loader.js`
  demonstrates the hydration pattern live for Hero, Contact, and SEO fields.

## What needs real work before going live (be aware of these)

1. **Photography**: all images are curated Unsplash stock photos as placeholders.
   Replace with real venue photography — search/replace the `images.unsplash.com`
   URLs (search "REPLACE" is not used; just find/replace by section) or point them
   at your own CDN.
2. **Decap CMS is scaffolded, not fully wired**: the config defines every collection
   from the brief and content is stored as editable JSON, but only Hero/Contact/SEO
   are hydrated into the DOM at runtime as a working example. Wiring the remaining
   collections (services, packages, gallery, testimonials, FAQs, menu) into the DOM
   follows the exact same `content-loader.js` pattern — repeat `getJSON()` +
   `querySelectorAll` per collection, or migrate the whole site to a static-site
   generator (Eleventy/Hugo/Astro) that reads `/content` at build time for a more
   robust long-term setup. Decap also requires Git Gateway/Identity configured on
   your host (Netlify, or GitHub OAuth) before the `/admin` panel will authenticate.
3. **Calendar data is sample data**: `BOOKED_DATES` in `js/main.js` is hardcoded.
   Connect it to a real reservations database/API for accurate availability.
4. **WhatsApp number and all contact details are placeholders** — update every
   `+92 300 1234567` / `923001234567` / `events@mehrabhall.com` reference (or better,
   drive them all from `content/contact.json` once you extend the content loader).
5. **Map** uses a keyless Google Maps embed centered on a generic Lahore address —
   replace with your exact address/coordinates or a proper Maps Embed API key.
6. **Performance**: images should be served pre-optimized (WebP/AVIF, correct
   dimensions) from your own CDN in production rather than hot-linked from Unsplash.
7. **Lighthouse/cross-browser QA**: the code follows best practices (semantic HTML,
   lazy-loaded below-the-fold images, no layout-shifting fonts via `font-display:
   swap`, minimal JS, no console errors in testing), but run Lighthouse and real
   device testing on your actual hosting environment before launch, since fonts,
   maps, and third-party embeds affect real-world scores.

## File structure

```
wedding-hall/
├── index.html
├── privacy-policy.html
├── terms.html
├── offline.html
├── manifest.json
├── sw.js
├── robots.txt
├── sitemap.xml
├── css/
│   ├── base.css          (design tokens, reset, typography, layout)
│   ├── components.css    (nav, hero, cards, forms, gallery, etc.)
│   └── responsive.css    (breakpoint fine-tuning)
├── js/
│   ├── main.js            (all interactivity)
│   └── content-loader.js  (CMS JSON hydration example)
├── icons/                 (generated PWA icons)
├── admin/
│   ├── index.html          (Decap CMS entry)
│   └── config.yml          (CMS collections)
└── content/                (CMS-editable JSON — seed data)
```

## Design system

- **Colors**: Maroon `#5A0B18`, Deep Red `#8B1E2D`, Cream `#F7F0E8`,
  Gold `#D4AF37`, White `#FFFFFF`, Text `#2B2B2B` — defined as CSS variables
  in `css/base.css`.
- **Type**: Playfair Display (headings) + Poppins (body), loaded via Google Fonts
  with `display=swap`.
- **Signature motif**: a hand-drawn gold ornamental divider (`#i-ornament` SVG
  symbol) and a monogram mark, used consistently as the section-break signature
  instead of generic icon dividers.
