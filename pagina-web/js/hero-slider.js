/**
 * hero-slider.js — comportamiento del banner rotativo de Inicio.
 *
 * A diferencia de header/footer/chatbot/picker, esto NO es un componente
 * global: solo lo usa la página de Inicio, así que vive como script de
 * página normal (busca [data-hero] y no hace nada si no lo encuentra).
 */
(function () {
  const hero = document.querySelector("[data-hero]");
  if (!hero) return;

  const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
  const prevBtn = hero.querySelector("[data-hero-prev]");
  const nextBtn = hero.querySelector("[data-hero-next]");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let index = 0;
  let timer = null;

  function show(newIndex, { animate = true } = {}) {
    index = (newIndex + slides.length) % slides.length;

    slides.forEach((slide, i) => {
      const active = i === index;
      slide.classList.toggle("opacity-100", active);
      slide.classList.toggle("pointer-events-auto", active);
      slide.classList.toggle("opacity-0", !active);
      slide.classList.toggle("pointer-events-none", !active);
      slide.classList.remove("is-entering");

      if (active && animate && !prefersReducedMotion) {
        // Reinicia la entrada tipográfica en cada cambio de diapositiva
        void slide.offsetWidth;
        slide.classList.add("is-entering");
      }
    });

    dots.forEach((dot, i) => {
      const active = i === index;
      const widthClass = active ? "w-8" : "w-2.5";
      dot.className = `h-2 rounded-full transition-all duration-300 ${widthClass} ${
        active ? "bg-accent" : "bg-white/40"
      }`;
      dot.setAttribute("aria-current", String(active));
    });
  }

  function next() {
    show(index + 1);
  }

  function prev() {
    show(index - 1);
  }

  function startAutoplay() {
    stopAutoplay();
    if (prefersReducedMotion || slides.length < 2) return;
    timer = setInterval(next, 7000);
  }

  function stopAutoplay() {
    if (timer) clearInterval(timer);
  }

  prevBtn.addEventListener("click", () => {
    prev();
    startAutoplay();
  });
  nextBtn.addEventListener("click", () => {
    next();
    startAutoplay();
  });
  dots.forEach((dot, i) =>
    dot.addEventListener("click", () => {
      show(i);
      startAutoplay();
    })
  );

  hero.addEventListener("mouseenter", stopAutoplay);
  hero.addEventListener("mouseleave", startAutoplay);
  hero.addEventListener("focusin", stopAutoplay);
  hero.addEventListener("focusout", startAutoplay);

  // Primera pintura: marca listo y anima la entrada una sola vez
  requestAnimationFrame(() => {
    hero.classList.add("is-ready");
    show(0, { animate: true });
    startAutoplay();
  });
})();
