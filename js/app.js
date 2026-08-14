(function () {
  "use strict";

  const THEME_MAP = {
    accueil: "home",
    technique: "technique",
    projet: "projet",
    integration: "integration",
  };

  const DEFAULT_SUB = {
    technique: "technique-trace-1",
    projet: "projet-trace-5",
    integration: "integration-trace-8",
  };

  let currentPage = "accueil";
  let currentSub = {};

  const sidebar = document.querySelector(".sidebar");
  const overlay = document.querySelector(".sidebar-overlay");
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelectorAll("[data-page]");
  const panels = document.querySelectorAll(".page-panel");

  function setTheme(page) {
    const theme = THEME_MAP[page];
    if (!theme || theme === "home") {
      document.body.removeAttribute("data-theme");
    } else {
      document.body.setAttribute("data-theme", theme);
    }
  }

  function activateSub(page, subId) {
    const panel = document.getElementById("panel-" + page);
    if (!panel) return;

    panel.querySelectorAll(".sub-panel").forEach(function (sp) {
      sp.classList.toggle("active", sp.dataset.sub === subId);
    });

    panel.querySelectorAll(".subnav a").forEach(function (link) {
      link.classList.toggle("active", link.dataset.sub === subId);
    });

    currentSub[page] = subId;
  }

  function navigateTo(page, subId) {
    if (!document.getElementById("panel-" + page)) return;

    currentPage = page;
    if (!subId) {
      subId = currentSub[page] || DEFAULT_SUB[page] || null;
    }

    panels.forEach(function (p) {
      p.classList.toggle("active", p.id === "panel-" + page);
    });

    navLinks.forEach(function (link) {
      if (link.dataset.page && link.closest(".sidebar, .site-header")) {
        link.classList.toggle("active", link.dataset.page === page);
      }
    });

    setTheme(page);

    if (subId) {
      activateSub(page, subId);
    }

    closeSidebar();
    document.querySelector(".page-frame").scrollTop = 0;
  }

  function closeSidebar() {
    sidebar.classList.remove("open");
    overlay.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  }

  navLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const page = link.dataset.page;
      const sub = link.dataset.sub || null;
      navigateTo(page, sub);
    });
  });

  document.querySelectorAll(".subnav a").forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      activateSub(currentPage, link.dataset.sub);
    });
  });

  document.querySelectorAll(".trace-link").forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const href = link.getAttribute("href") || "";
      if (!href.startsWith("#sub-")) return;
      const subId = href.slice(5);
      const panel = link.closest(".page-panel");
      const page = panel ? panel.id.replace("panel-", "") : currentPage;
      if (page !== currentPage) {
        navigateTo(page, subId);
      } else {
        activateSub(page, subId);
        document.querySelector(".page-frame").scrollTop = 0;
      }
    });
  });

  document.querySelectorAll(".quick-btn").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      navigateTo(btn.dataset.page, btn.dataset.sub || null);
    });
  });

  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      const open = sidebar.classList.toggle("open");
      overlay.classList.toggle("open", open);
      menuToggle.setAttribute("aria-expanded", String(open));
    });
  }

  if (overlay) {
    overlay.addEventListener("click", closeSidebar);
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (closeLightbox()) return;
      closeSidebar();
    }
  });

  /* ── Lightbox ── */
  const lightbox = document.getElementById("image-lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");

  function openLightbox(img, caption) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    if (lightboxCaption) {
      lightboxCaption.textContent = caption || img.alt;
    }
    lightbox.hidden = false;
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
    lightbox.querySelector(".image-lightbox-close").focus();
  }

  function closeLightbox() {
    if (!lightbox || lightbox.hidden) return false;
    lightbox.hidden = true;
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImg.src = "";
    document.body.classList.remove("lightbox-open");
    return true;
  }

  document.querySelectorAll(".trace-image-frame--zoomable").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const img = btn.querySelector("img");
      const slide = btn.closest(".carousel-slide");
      const slideCaption = slide ? slide.querySelector(".slide-caption") : null;
      const figure = btn.closest("figure");
      const caption = figure ? figure.querySelector("figcaption") : null;
      const text = slideCaption
        ? slideCaption.textContent.trim()
        : (caption ? caption.textContent.trim() : "");
      if (img) openLightbox(img, text);
    });
  });

  function moveSlide(carouselId, direction) {
    const carousel = document.getElementById(carouselId);
    if (!carousel) return;
    const slides = carousel.querySelectorAll(".carousel-slide");
    let activeIndex = Array.from(slides).findIndex(function (slide) {
      return slide.classList.contains("active");
    });
    if (activeIndex < 0) activeIndex = 0;
    setSlide(carouselId, (activeIndex + direction + slides.length) % slides.length);
  }

  function setSlide(carouselId, index) {
    const carousel = document.getElementById(carouselId);
    if (!carousel) return;
    const slides = carousel.querySelectorAll(".carousel-slide");
    const dots = carousel.querySelectorAll(".dot");

    slides.forEach(function (slide, i) {
      slide.classList.toggle("active", i === index);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("active", i === index);
    });
  }

  document.querySelectorAll("[data-carousel-dir]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      moveSlide(btn.dataset.carousel, Number(btn.dataset.carouselDir));
    });
  });

  document.querySelectorAll("[data-carousel-index]").forEach(function (dot) {
    dot.addEventListener("click", function () {
      setSlide(dot.dataset.carousel, Number(dot.dataset.carouselIndex));
    });
  });

  if (lightbox) {
    lightbox.querySelectorAll("[data-lightbox-close]").forEach(function (el) {
      el.addEventListener("click", closeLightbox);
    });
  }

  navigateTo("accueil");
})();
