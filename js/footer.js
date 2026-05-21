/**
 * footer.js : pin + scrub reveal of jumbo brand
 *
 * Scroll budget = 0.6 * viewport. Pin holds the 100vh footer at top
 * while jumbo lines + meta rows scrub from below into place.
 */

export function initFooter() {
  const gsap = window.gsap;
  const ST   = window.ScrollTrigger;

  const footer = document.getElementById('footer');
  if (!footer) return;

  const pin    = footer.querySelector('.fw-footer-pin');
  const lines  = footer.querySelectorAll('.fw-footer-jumbo-inner');
  const top    = footer.querySelector('.fw-footer-top-row');
  const bottom = footer.querySelector('.fw-footer-bottom-row');

  if (!gsap || !ST || !pin || !lines.length) return;

  gsap.registerPlugin(ST);

  // Initial state for the scrub-revealed bits
  gsap.set(lines,  { yPercent: 100, opacity: 0 });
  gsap.set(top,    { opacity: 0, y: -10 });
  gsap.set(bottom, { opacity: 0, y: 10 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: footer,
      start: 'top bottom',
      end: () => `+=${window.innerHeight * 1.1}`,
      scrub: 0.8,
      invalidateOnRefresh: true,
    },
  });

  tl.to(top,    { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }, 0)
    .to(lines,  {
      yPercent: 0,
      opacity: 1,
      duration: 0.6,
      stagger: 0.08,
      ease: 'power3.out',
    }, 0.05)
    .to(bottom, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, 0.45);

  // Pin keeps the jumbo on screen so the reveal feels "held"
  ST.create({
    trigger: footer,
    start: 'top top',
    end: () => `+=${window.innerHeight * 0.6}`,
    pin: pin,
    pinSpacing: true,
    anticipatePin: 1,
    invalidateOnRefresh: true,
  });
}
