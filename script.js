(() => {
  "use strict";

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  const menuButton = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector(".mobile-nav");

  const closeMenu = () => {
    if (!menuButton || !mobileNav) return;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation");
    mobileNav.setAttribute("aria-hidden", "true");
    mobileNav.classList.remove("is-open");
  };

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", () => {
      const isOpen = menuButton.getAttribute("aria-expanded") !== "true";
      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
      mobileNav.setAttribute("aria-hidden", String(!isOpen));
      mobileNav.classList.toggle("is-open", isOpen);
    });
    mobileNav.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") closeMenu();
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 780) closeMenu();
    });
  }

  const progress = document.querySelector(".reading-progress");
  const parallaxImages = [...document.querySelectorAll(".field-image img")];
  const portraitImage = document.querySelector(".portrait-frame img");
  let progressQueued = false;
  const updateProgress = () => {
    if (!progress) return;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = String(scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0) + "%";
    [...parallaxImages, portraitImage].filter(Boolean).forEach(image => {
      const bounds = image.parentElement.getBoundingClientRect();
      const distance = (bounds.top + bounds.height / 2 - window.innerHeight / 2) * -0.025;
      const shift = Math.max(-14, Math.min(14, distance));
      image.style.setProperty(image === portraitImage ? "--portrait-shift" : "--parallax", String(shift) + "px");
    });
    progressQueued = false;
  };
  window.addEventListener("scroll", () => {
    if (progressQueued) return;
    progressQueued = true;
    window.requestAnimationFrame(updateProgress);
  }, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();

  const revealItems = document.querySelectorAll("[data-reveal]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if ("IntersectionObserver" in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    revealItems.forEach(item => revealObserver.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add("is-visible"));
  }

  const sections = [...document.querySelectorAll("main section[id]")];
  const navLinks = [...document.querySelectorAll(".desktop-nav a")];
  if ("IntersectionObserver" in window && sections.length && navLinks.length) {
    const activeObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const hasNavLink = navLinks.some(link => link.getAttribute("href") === "#" + entry.target.id);
        if (!hasNavLink) {
          if (entry.target.id === "home") {
            navLinks.forEach(link => {
              link.classList.remove("is-active");
              link.removeAttribute("aria-current");
            });
          }
          return;
        }
        navLinks.forEach(link => {
          const active = link.getAttribute("href") === "#" + entry.target.id;
          link.classList.toggle("is-active", active);
          if (active) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-38% 0px -52% 0px" });
    sections.forEach(section => activeObserver.observe(section));
  }

  const portrait = document.querySelector("[data-tilt]");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (portrait && finePointer && !reducedMotion) {
    const frame = portrait.querySelector(".portrait-frame");
    let queued = false;
    let point = { x: 0, y: 0 };
    portrait.addEventListener("pointermove", event => {
      const bounds = portrait.getBoundingClientRect();
      point.x = (event.clientX - bounds.left) / bounds.width - 0.5;
      point.y = (event.clientY - bounds.top) / bounds.height - 0.5;
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(() => {
        frame.style.setProperty("--tilt-x", String(point.x * 2.4) + "deg");
        frame.style.setProperty("--tilt-y", String(point.y * -2.4) + "deg");
        queued = false;
      });
    });
    portrait.addEventListener("pointerleave", () => {
      frame.style.setProperty("--tilt-x", "0deg");
      frame.style.setProperty("--tilt-y", "0deg");
    });
  }

  if (finePointer && !reducedMotion) {
    document.querySelectorAll(".project").forEach(project => {
      const visual = project.querySelector(".project-visual");
      if (!visual) return;
      project.addEventListener("pointermove", event => {
        const bounds = project.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        visual.style.setProperty("--card-x", String(x * 3.5) + "deg");
        visual.style.setProperty("--card-y", String(y * -3.5) + "deg");
      });
      project.addEventListener("pointerleave", () => {
        visual.style.setProperty("--card-x", "0deg");
        visual.style.setProperty("--card-y", "0deg");
      });
    });
  }
})();
