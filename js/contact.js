/**
 * contact.js v2: IntersectionObserver reveal (no pin, no scrub)
 *
 * Pin + scrub contact lama bikin handoff dari projects (sticky) ke
 * contact (GSAP pin) kacau: opacity 0 initial bikin section keliatan
 * blank di tengah, lalu tiba-tiba fade in pas trigger. Sekarang:
 * - Section flow natural (no pin)
 * - IO fires sekali pas section masuk viewport ~30%, run timeline
 * - Parallax deco "04" tetap pakai scrub (separate trigger, no pin)
 */

export function initContact() {
  const gsap = window.gsap;
  const ST   = window.ScrollTrigger;

  const sec = document.getElementById('contact');
  if (!sec) return;

  const title   = sec.querySelector('.fw-contact-title');
  const intro   = sec.querySelector('.fw-contact-intro');
  const cards   = sec.querySelectorAll('.fw-contact-card');
  const decoNum = sec.querySelector('.fw-contact-deco-num');

  // No GSAP fallback: show everything
  if (!gsap) {
    [title, intro, ...cards].forEach((el) => {
      if (el) { el.style.opacity = 1; el.style.transform = 'none'; }
    });
    return;
  }

  // Initial state: slight offset + invisible. IO akan trigger reveal sekali.
  gsap.set(title, { opacity: 0, y: 30 });
  gsap.set(intro, { opacity: 0, y: 20 });
  gsap.set(cards, { opacity: 0, y: 24, scale: 0.94 });

  let played = false;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || played) return;
      played = true;

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.to(title, { opacity: 1, y: 0, duration: 0.7 })
        .to(intro, { opacity: 1, y: 0, duration: 0.55 }, '-=0.45')
        .to(cards, {
          opacity: 1, y: 0, scale: 1,
          duration: 0.55,
          stagger: 0.08,
        }, '-=0.35');

      io.disconnect();
    });
  }, {
    rootMargin: '0px 0px -20% 0px',
    threshold: 0,
  });
  io.observe(sec);

  // Parallax deco "04": scroll-linked drift, no pin
  if (decoNum && ST) {
    gsap.registerPlugin(ST);
    const isMobile = window.innerWidth <= 900;
    gsap.to(decoNum, {
      x: isMobile ? -40 : -80,
      y: isMobile ? -30 : -50,
      ease: 'none',
      scrollTrigger: {
        trigger: sec,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      },
    });
  }
}
