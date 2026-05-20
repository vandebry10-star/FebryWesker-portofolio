/**
 * about.js: Pinned narrative reveal
 * Stages (scrub timeline):
 *   0.00 to 0.20: quote line 1
 *   0.12 to 0.32: quote line 2
 *   0.24 to 0.44: quote line 3
 *   0.40 to 0.58: sub paragraph
 *   0.55 to 0.78: stats grid stagger
 *   0.72 to 0.86: meta line
 *   0.82 to 1.00: interest tags stagger
 *
 * Always visible (no opacity 0 on init):
 *   - Label row
 *   - Decorative number "01" (with parallax drift)
 *   - Vertical anchor line
 */

export function initAbout() {
  const gsap = window.gsap;
  const ST   = window.ScrollTrigger;

  const sec = document.getElementById('about');
  if (!sec) return;

  if (!gsap || !ST) {
    sec.querySelectorAll(
      '.fw-about-line, .fw-about-sub, .fw-about-stat, ' +
      '.fw-about-meta, .fw-about-tag'
    ).forEach((el) => {
      el.style.opacity = 1;
      el.style.transform = 'none';
    });
    return;
  }

  gsap.registerPlugin(ST);

  const lines   = sec.querySelectorAll('.fw-about-line');
  const sub     = sec.querySelector('.fw-about-sub');
  const stats   = sec.querySelectorAll('.fw-about-stat');
  const meta    = sec.querySelector('.fw-about-meta');
  const tags    = sec.querySelectorAll('.fw-about-tag');
  const decoNum = sec.querySelector('.fw-about-deco-num');
  const pin     = sec.querySelector('.fw-about-pin');

  if (!pin) return;

  gsap.set(lines,  { opacity: 0, y: 40 });
  gsap.set(sub,    { opacity: 0, y: 20 });
  gsap.set(stats,  { opacity: 0, y: 26, scale: 0.92 });
  gsap.set(meta,   { opacity: 0, y: 14 });
  gsap.set(tags,   { opacity: 0, y: 14, scale: 0.88 });

  const isMobile = window.innerWidth <= 900;
  const budget = isMobile ? 1.2 : 1.6;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: sec,
      start: 'top top',
      end: () => `+=${window.innerHeight * budget}`,
      pin: pin,
      scrub: 0.6,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
    defaults: { ease: 'power2.out' },
  });

  tl.to(lines[0], { opacity: 1, y: 0, duration: 0.20 }, 0.00)
    .to(lines[1], { opacity: 1, y: 0, duration: 0.20 }, 0.12)
    .to(lines[2], { opacity: 1, y: 0, duration: 0.20 }, 0.24)
    .to(sub,    { opacity: 1, y: 0, duration: 0.18 }, 0.40)
    .to(stats,  {
      opacity: 1, y: 0, scale: 1,
      duration: 0.22,
      stagger: 0.04,
    }, 0.55)
    .to(meta,   { opacity: 1, y: 0, duration: 0.14 }, 0.72)
    .to(tags,   {
      opacity: 1, y: 0, scale: 1,
      duration: 0.18,
      stagger: 0.025,
    }, 0.82);

  // Parallax drift on decorative number
  if (decoNum) {
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
