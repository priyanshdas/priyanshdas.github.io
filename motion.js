// Apple-style scroll motion.
// Headlines rise in word by word, content fades up in a gentle stagger,
// photos unmask as they arrive, and the hero eases back as you scroll past.
// Everything is skipped for people who've asked their system for less motion.
(() => {
  "use strict";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!("IntersectionObserver" in window)) return;

  const root = document.documentElement;
  root.classList.add("motion");

  // Reveal things once they scroll into view. Anything that's already above
  // the viewport when the page loads (say, after a refresh halfway down)
  // is shown straight away so it never gets stuck invisible.
  const reveal = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting || entry.boundingClientRect.bottom < 0) {
        entry.target.classList.add("is-in");
        reveal.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -10% 0px", threshold: 0.08 });

  // 1. Headlines: wrap each word so it can slide up from behind a mask.
  const headlines = document.querySelectorAll(
    ".about-heading h2, .work-intro h2, .field-heading h2, .practice-head h2, .contact-main h2"
  );

  let wordIndex = 0;
  const splitWords = node => {
    [...node.childNodes].forEach(child => {
      if (child.nodeType === Node.TEXT_NODE) {
        const parts = child.textContent.split(/(\s+)/);
        const frag = document.createDocumentFragment();
        parts.forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(part));
            return;
          }
          const mask = document.createElement("span");
          mask.className = "word";
          const inner = document.createElement("span");
          inner.textContent = part;
          inner.style.setProperty("--w", wordIndex++);
          mask.appendChild(inner);
          frag.appendChild(mask);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== "BR") {
        splitWords(child);
      }
    });
  };

  headlines.forEach(heading => {
    wordIndex = 0;
    // Keep a clean label for screen readers; line breaks become spaces.
    const copy = heading.cloneNode(true);
    copy.querySelectorAll("br").forEach(br => br.replaceWith(" "));
    heading.setAttribute("aria-label", copy.textContent.replace(/\s+/g, " ").trim());
    splitWords(heading);
    heading.classList.add("split");
    reveal.observe(heading);
  });

  // 2. Content that rises in. Items inside the same group get a small
  //    stagger so a row of cards arrives one after another, not all at once.
  const groups = [
    ".education", ".practice-grid", ".side-project-list", ".recipe-grid", ".contact-links"
  ];
  groups.forEach(selector => {
    document.querySelectorAll(selector).forEach(group => {
      [...group.children].forEach((item, i) => item.style.setProperty("--stagger", i));
    });
  });

  document.querySelectorAll([
    ".section-head",
    ".about-index",
    ".about-copy > *",
    ".education-label",
    ".education-item",
    ".work-intro > p",
    ".field-heading > p",
    ".practice-head > p",
    ".practice-card",
    ".side-project",
    ".recipe-card",
    ".work-footer",
    ".contact-main .eyebrow",
    ".contact-button",
    ".contact-footer"
  ].join(",")).forEach(item => {
    if (item.hasAttribute("data-reveal")) return; // already handled by script.js
    item.setAttribute("data-rise", "");
    reveal.observe(item);
  });

  // 3. Photos unmask from a slightly smaller frame as they arrive.
  document.querySelectorAll(".field-image, .project-visual").forEach(frame => {
    frame.setAttribute("data-unmask", "");
    reveal.observe(frame);
  });

  // 4. The hero eases back (fades, drifts and shrinks a touch) as you
  //    scroll past it, so the next section feels like it slides over the top.
  const hero = document.querySelector(".hero");
  if (hero) {
    let queued = false;
    const update = () => {
      const height = hero.offsetHeight || 1;
      const progress = Math.min(1, Math.max(0, window.scrollY / height));
      hero.style.setProperty("--hero-p", progress.toFixed(4));
      queued = false;
    };
    window.addEventListener("scroll", () => {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(update);
    }, { passive: true });
    window.addEventListener("resize", update);
    update();
  }
})();
