/* ==========================================================================
   MEHRAB HALL — Main JS
   Vanilla JS, no dependencies, progressively enhanced.
   ========================================================================== */
(function () {
  "use strict";

  const $  = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------
     0. Loading screen
  --------------------------------------------------------- */
  window.addEventListener("load", () => {
    const loader = $("#loader");
    if (!loader) return;
    setTimeout(() => loader.classList.add("is-hidden"), 350);
  });

  /* ---------------------------------------------------------
     1. Sticky nav + mobile menu + scroll progress + back-to-top
  --------------------------------------------------------- */
  const nav = $("#siteNav");
  const navToggle = $("#navToggle");
  const navLinks = $("#navLinks");
  const navBackdrop = $("#navBackdrop");
  const progressBar = $("#scrollProgress");
  const backToTop = $("#backToTop");

  function closeMenu() {
    navLinks.classList.remove("is-open");
    navBackdrop.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }
  function openMenu() {
    navLinks.classList.add("is-open");
    navBackdrop.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
  }
  if (navToggle) {
    navToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.contains("is-open");
      isOpen ? closeMenu() : openMenu();
    });
  }
  navBackdrop && navBackdrop.addEventListener("click", closeMenu);
  $$("#navLinks a").forEach((a) => a.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  function onScroll() {
    const y = window.scrollY || window.pageYOffset;
    // sticky nav state
    if (nav) nav.classList.toggle("is-scrolled", y > 40);
    // scroll progress
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docH > 0 ? (y / docH) * 100 : 0;
    if (progressBar) progressBar.style.width = pct + "%";
    // back to top visibility
    if (backToTop) backToTop.classList.toggle("is-visible", y > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  backToTop &&
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });

  /* ---------------------------------------------------------
     2. Scroll reveal animations (IntersectionObserver)
  --------------------------------------------------------- */
  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    $$(".reveal").forEach((el) => revealObserver.observe(el));
  } else {
    $$(".reveal").forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------------------------------------------------------
     3. Animated counters (Hall Statistics)
  --------------------------------------------------------- */
  const counters = $$("[data-counter]");
  if (counters.length && "IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseInt(el.getAttribute("data-counter"), 10) || 0;
          const duration = prefersReducedMotion ? 0 : 1800;
          const start = performance.now();
          function tick(now) {
            const progress = duration === 0 ? 1 : Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(eased * target).toLocaleString();
            if (progress < 1) requestAnimationFrame(tick);
            else el.textContent = target.toLocaleString();
          }
          requestAnimationFrame(tick);
          counterObserver.unobserve(el);
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach((el) => counterObserver.observe(el));
  }

  /* ---------------------------------------------------------
     4. Gallery filter + Lightbox
  --------------------------------------------------------- */
  const galleryItems = $$(".gallery-item");
  const filterButtons = $$(".gallery-filters button");
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");
      filterButtons.filter((b) => b !== btn).forEach((b) => b.setAttribute("aria-pressed", "false"));
      const cat = btn.getAttribute("data-filter");
      galleryItems.forEach((item) => {
        const match = cat === "all" || item.getAttribute("data-category") === cat;
        item.classList.toggle("is-hidden", !match);
      });
    });
  });

  const lightbox = $("#lightbox");
  const lightboxImg = $("#lightboxImg");
  const lightboxCaption = $("#lightboxCaption");
  let currentGalleryIndex = 0;
  let visibleItems = [];

  function refreshVisibleItems() {
    visibleItems = galleryItems.filter((i) => !i.classList.contains("is-hidden"));
  }
  function openLightbox(item) {
    refreshVisibleItems();
    currentGalleryIndex = visibleItems.indexOf(item);
    updateLightbox();
    lightbox.classList.add("is-open");
    document.body.style.overflow = "hidden";
    $(".lightbox__close").focus();
  }
  function updateLightbox() {
    const item = visibleItems[currentGalleryIndex];
    if (!item) return;
    const img = item.querySelector("img");
    lightboxImg.src = img.getAttribute("data-full") || img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = item.getAttribute("data-caption") || img.alt;
  }
  function closeLightbox() {
    lightbox.classList.remove("is-open");
    document.body.style.overflow = "";
  }
  galleryItems.forEach((item) => {
    item.addEventListener("click", () => openLightbox(item));
    item.setAttribute("tabindex", "0");
    item.setAttribute("role", "button");
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLightbox(item);
      }
    });
  });
  $(".lightbox__close") && $(".lightbox__close").addEventListener("click", closeLightbox);
  $(".lightbox__prev") &&
    $(".lightbox__prev").addEventListener("click", () => {
      currentGalleryIndex = (currentGalleryIndex - 1 + visibleItems.length) % visibleItems.length;
      updateLightbox();
    });
  $(".lightbox__next") &&
    $(".lightbox__next").addEventListener("click", () => {
      currentGalleryIndex = (currentGalleryIndex + 1) % visibleItems.length;
      updateLightbox();
    });
  lightbox &&
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  document.addEventListener("keydown", (e) => {
    if (!lightbox || !lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") $(".lightbox__prev").click();
    if (e.key === "ArrowRight") $(".lightbox__next").click();
  });

  /* ---------------------------------------------------------
     5. Menu tabs (Catering)
  --------------------------------------------------------- */
  const menuTabs = $$(".menu-tabs button");
  const menuPanels = $$(".menu-panel");
  menuTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      menuTabs.forEach((t) => t.classList.remove("is-active"));
      tab.classList.add("is-active");
      const target = tab.getAttribute("data-menu");
      menuPanels.forEach((p) => p.classList.toggle("is-active", p.getAttribute("data-menu-panel") === target));
    });
  });

  /* ---------------------------------------------------------
     6. FAQ accordion
  --------------------------------------------------------- */
  $$(".faq-item__q").forEach((q) => {
    q.addEventListener("click", () => {
      const item = q.closest(".faq-item");
      const answer = item.querySelector(".faq-item__a");
      const isOpen = item.classList.contains("is-open");
      // close all
      $$(".faq-item").forEach((i) => {
        i.classList.remove("is-open");
        i.querySelector(".faq-item__q").setAttribute("aria-expanded", "false");
        i.querySelector(".faq-item__a").style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add("is-open");
        q.setAttribute("aria-expanded", "true");
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });

  /* ---------------------------------------------------------
     7. Testimonials slider
  --------------------------------------------------------- */
  const testiSlides = $("#testiSlides");
  const testiSlideEls = $$(".testi-slide");
  const testiDotsWrap = $("#testiDots");
  let testiIndex = 0;
  let testiTimer;

  if (testiSlides && testiSlideEls.length) {
    testiSlideEls.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", `Show testimonial ${i + 1}`);
      if (i === 0) dot.classList.add("is-active");
      dot.addEventListener("click", () => goToTesti(i));
      testiDotsWrap.appendChild(dot);
    });

    function goToTesti(i) {
      testiIndex = (i + testiSlideEls.length) % testiSlideEls.length;
      testiSlides.style.transform = `translateX(-${testiIndex * 100}%)`;
      $$("#testiDots button").forEach((d, di) => d.classList.toggle("is-active", di === testiIndex));
    }
    $("#testiPrev") && $("#testiPrev").addEventListener("click", () => { goToTesti(testiIndex - 1); resetTimer(); });
    $("#testiNext") && $("#testiNext").addEventListener("click", () => { goToTesti(testiIndex + 1); resetTimer(); });

    function resetTimer() {
      clearInterval(testiTimer);
      if (!prefersReducedMotion) testiTimer = setInterval(() => goToTesti(testiIndex + 1), 6000);
    }
    resetTimer();
  }

  /* ---------------------------------------------------------
     8. Availability calendar
  --------------------------------------------------------- */
  const calendarEl = $("#calendarGrid");
  const calendarMonthLabel = $("#calendarMonthLabel");
  const calendarDateInput = $("#eventDate");
  const calendarNote = $("#calendarSelectedNote");

  // Sample "booked" dates for demo purposes (CMS/backend would supply real data)
  const BOOKED_DATES = new Set(["2026-07-25", "2026-07-31", "2026-08-08", "2026-08-15", "2026-08-22", "2026-08-29"]);

  let calState = new Date();
  calState.setDate(1);
  let selectedDateStr = null;

  function fmtDate(y, m, d) {
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  function renderCalendar() {
    if (!calendarEl) return;
    const year = calState.getFullYear();
    const month = calState.getMonth();
    const monthName = calState.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    calendarMonthLabel.textContent = monthName;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let html = "";
    ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].forEach((d) => {
      html += `<div class="calendar__dow">${d}</div>`;
    });
    for (let i = 0; i < firstDay; i++) html += `<div class="calendar__day is-empty" aria-hidden="true"></div>`;

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = fmtDate(year, month, d);
      const dateObj = new Date(year, month, d);
      const isPast = dateObj < today;
      const isBooked = BOOKED_DATES.has(dateStr);
      const isToday = dateObj.getTime() === today.getTime();
      const isSelected = dateStr === selectedDateStr;

      let classes = "calendar__day";
      let label = "";
      if (isPast) {
        classes += " is-empty";
      } else if (isBooked) {
        classes += " is-booked";
        label = `${monthName.split(" ")[0]} ${d}, booked`;
      } else {
        classes += " is-available";
        label = `${monthName.split(" ")[0]} ${d}, available`;
      }
      if (isToday) classes += " is-today";
      if (isSelected) classes += " is-selected";

      const interactive = !isPast && !isBooked;
      html += `<div class="${classes}" ${interactive ? `role="button" tabindex="0" data-date="${dateStr}" aria-label="${label}"` : `aria-hidden="${isPast}"`}>${d}</div>`;
    }
    calendarEl.innerHTML = html;

    $$(".calendar__day.is-available", calendarEl).forEach((dayEl) => {
      dayEl.addEventListener("click", () => selectDate(dayEl.getAttribute("data-date")));
      dayEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectDate(dayEl.getAttribute("data-date"));
        }
      });
    });
  }

  function selectDate(dateStr) {
    selectedDateStr = dateStr;
    if (calendarDateInput) calendarDateInput.value = dateStr;
    if (calendarNote) {
      const d = new Date(dateStr + "T00:00:00");
      calendarNote.textContent = `Selected date: ${d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}. This has been added to your booking form below.`;
    }
    renderCalendar();
    const bookingSection = $("#booking");
    if (bookingSection) {
      // gentle nudge, not a forced jump
      calendarDateInput.closest("form") && calendarDateInput.classList.add("is-flagged");
    }
  }

  $("#calPrev") &&
    $("#calPrev").addEventListener("click", () => {
      calState.setMonth(calState.getMonth() - 1);
      renderCalendar();
    });
  $("#calNext") &&
    $("#calNext").addEventListener("click", () => {
      calState.setMonth(calState.getMonth() + 1);
      renderCalendar();
    });
  renderCalendar();

  /* ---------------------------------------------------------
     9. Booking form validation + WhatsApp integration
  --------------------------------------------------------- */
  const bookingForm = $("#bookingForm");
  const WHATSAPP_NUMBER = "923001234567"; // TODO: replace with real business number

  function showError(field, message) {
    const wrap = field.closest(".form-field");
    wrap.classList.toggle("has-error", !!message);
    const errorEl = wrap.querySelector(".form-error");
    if (errorEl) errorEl.textContent = message || "";
  }

  function validateField(field) {
    const value = field.value.trim();
    if (field.hasAttribute("required") && !value) {
      showError(field, "This field is required.");
      return false;
    }
    if (field.type === "email" && value) {
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      if (!ok) { showError(field, "Enter a valid email address."); return false; }
    }
    if (field.type === "tel" && value) {
      const ok = /^[0-9+\-\s()]{7,20}$/.test(value);
      if (!ok) { showError(field, "Enter a valid phone number."); return false; }
    }
    if (field.name === "guests" && value) {
      const n = parseInt(value, 10);
      if (isNaN(n) || n < 10 || n > 5000) { showError(field, "Enter a guest count between 10 and 5000."); return false; }
    }
    showError(field, "");
    return true;
  }

  if (bookingForm) {
    const fields = $$("input, select, textarea", bookingForm);
    fields.forEach((f) => f.addEventListener("blur", () => validateField(f)));

    bookingForm.addEventListener("submit", (e) => {
      e.preventDefault();
      let valid = true;
      fields.forEach((f) => { if (!validateField(f)) valid = false; });
      if (!valid) {
        const firstError = bookingForm.querySelector(".has-error input, .has-error select, .has-error textarea");
        firstError && firstError.focus();
        return;
      }

      const data = Object.fromEntries(new FormData(bookingForm).entries());
      const message =
        `New Booking Enquiry — Mehrab Hall%0A` +
        `Name: ${data.name}%0A` +
        `Phone: ${data.phone}%0A` +
        `Email: ${data.email}%0A` +
        `Event Type: ${data.eventType}%0A` +
        `Guests: ${data.guests}%0A` +
        `Date: ${data.date || "Not specified"}%0A` +
        `Time: ${data.time}%0A` +
        `Package: ${data.package}%0A` +
        `Message: ${data.message || "-"}`;

      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
      window.open(waUrl, "_blank", "noopener");

      const successBox = $("#formSuccess");
      if (successBox) {
        successBox.classList.add("is-visible");
        successBox.setAttribute("tabindex", "-1");
        successBox.focus();
      }
      bookingForm.reset();
      selectedDateStr = null;
      renderCalendar();
    });
  }

  /* ---------------------------------------------------------
     10. Footer year
  --------------------------------------------------------- */
  const yearEl = $("#currentYear");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------
     11. Service worker registration (PWA)
  --------------------------------------------------------- */
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* silent fail — offline support is progressive enhancement */
      });
    });
  }
})();
