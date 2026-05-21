/**
 * footer.js : simple fade-in reveal of footer columns on scroll
 */

export function initFooter() {
  const gsap = window.gsap;
  const ST   = window.ScrollTrigger;

  const footer = document.getElementById('footer');
  if (!footer) return;

  const brand   = footer.querySelector('.fw-footer-brand');
  const cols    = footer.querySelectorAll('.fw-footer-col');
  const bottom  = footer.querySelector('.fw-footer-bottom-row');

  if (!gsap || !ST) {
    [brand, bottom, ...cols].forEach((el) => {
      if (el) { el.style.opacity = 1; el.style.transform = 'none'; }
    });
    return;
  }

  gsap.registerPlugin(ST);

  const targets = [brand, ...cols, bottom].filter(Boolean);
  gsap.set(targets, { opacity: 0, y: 24 });

  gsap.to(targets, {
    opacity: 1,
    y: 0,
    duration: 0.7,
    ease: 'power3.out',
    stagger: 0.1,
    scrollTrigger: {
      trigger: footer,
      start: 'top 85%',
      toggleActions: 'play none none none',
    },
  });
}
