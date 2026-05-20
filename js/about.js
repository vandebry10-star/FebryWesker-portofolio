/**
 * about.js: Pinned narrative reveal
 *
 * Budget diperpanjang + hold buffer 10% di awal :
 * fast-scroller butuh waktu sadar section ke-pin sebelum animasi mulai.
 * Tanpa buffer, animasi lewat sebelum mata mereka catch up.
 *
 * Stages (scrub timeline):
 *   0.00 to 0.10: HOLD (pin grab, no animation)
 *   0.10 to 0.28: quote line 1
 *   0.20 to 0.38: quote line 2
 *   0.30 to 0.48: quote line 3
 *   0.46 to 0.62: sub paragraph
 *   0.58 to 0.78: stats grid stagger
 *   0.74 to 0.86: meta line
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
  // Diperpanjang dari 1.2/1.6 : kasih fast-scroller waktu sadar
  // section ke-pin sebelum animasi selesai. Total scroll ~2.4 viewport
  // di desktop ~= 2.5x panjang section biasa.
  const budget = isMobile ? 1.8 : 2.4;

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

  // Semua position di-shift +0.10 dari versi lama : 0-0.10 = hold buffer.
  tl.to(lines[0], { opacity: 1, y: 0, duration: 0.18 }, 0.10)
    .to(lines[1], { opacity: 1, y: 0, duration: 0.18 }, 0.20)
    .to(lines[2], { opacity: 1, y: 0, duration: 0.18 }, 0.30)
    .to(sub,    { opacity: 1, y: 0, duration: 0.16 }, 0.46)
    .to(stats,  {
      opacity: 1, y: 0, scale: 1,
      duration: 0.20,
      stagger: 0.04,
    }, 0.58)
    .to(meta,   { opacity: 1, y: 0, duration: 0.12 }, 0.74)
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
