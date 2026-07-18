/* ==========================================================================
   MEHRAB HALL — Content Loader
   Proof-of-concept runtime hydration from Decap-CMS-editable /content/*.json.
   Falls back silently to the static HTML already in the page if a fetch
   fails (e.g. when opened via file:// without a server), so the site never
   breaks. Extend this pattern to hydrate the remaining CMS collections
   (services, packages, gallery, testimonials, faqs, menu) the same way.
   ========================================================================== */
(function () {
  "use strict";

  async function getJSON(path) {
    try {
      const res = await fetch(path, { cache: "no-store" });
      if (!res.ok) throw new Error("not ok");
      return await res.json();
    } catch (err) {
      return null; // graceful no-op fallback
    }
  }

  function setText(selector, value) {
    if (!value) return;
    const el = document.querySelector(selector);
    if (el) el.textContent = value;
  }

  async function hydrateSEO() {
    const data = await getJSON("content/seo.json");
    if (!data) return;
    if (data.title) document.title = data.title;
    const desc = document.querySelector('meta[name="description"]');
    if (desc && data.description) desc.setAttribute("content", data.description);
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical && data.canonical) canonical.setAttribute("href", data.canonical);
  }

  async function hydrateHero() {
    const data = await getJSON("content/hero.json");
    if (!data) return;
    setText("#hero .eyebrow", data.eyebrow);
    const h1 = document.querySelector("#hero h1");
    if (h1 && data.headline) h1.textContent = data.headline;
    setText("#hero .hero__tagline", data.tagline);
    const img = document.querySelector("#hero .hero__media img");
    if (img && data.backgroundImage) img.src = data.backgroundImage;
    if (Array.isArray(data.stats)) {
      const statEls = document.querySelectorAll("#hero .hero__stat b");
      data.stats.forEach((s, i) => {
        if (statEls[i]) statEls[i].setAttribute("data-counter", s.value);
      });
    }
  }

  async function hydrateContact() {
    const data = await getJSON("content/contact.json");
    if (!data) return;
    document.querySelectorAll('a[href^="tel:"]').forEach((a) => {
      if (data.phone) a.setAttribute("href", "tel:" + data.phone.replace(/\s+/g, ""));
    });
    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
    emailLinks.forEach((a) => {
      if (data.email) a.setAttribute("href", "mailto:" + data.email);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    hydrateSEO();
    hydrateHero();
    hydrateContact();
  });
})();
