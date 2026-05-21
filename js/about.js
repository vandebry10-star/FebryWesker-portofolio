/**
 * about.js : pinned manifesto + word-by-word reveal
 *
 * Stages (scrub timeline):
 *   0.00 to 0.10: HOLD (pin grab, fast-scroller catch-up)
 *   0.10 to 0.75: words reveal in stagger
 *   0.78 to 0.88: signature
 *   0.88 to 1.00: cue
 */

export function initAbout() {
  const gsap = window.gsap;
  const ST   = window.ScrollTrigger;

  const sec = document.getElementById('about');
  if (!sec) return;

  const manifesto = sec.querySelector('.fw-about-manifesto');
  const sign      = sec.querySelector('.fw-about-sign');
  const cue       = sec.querySelector('.fw-about-cue');
  const pin       = sec.querySelector('.fw-about-pin');
  const ghost     = sec.querySelector('#about-ghost');
  if (!manifesto || !pin) return;

  // Split manifesto into per-word spans
  const raw = (manifesto.dataset.text || manifesto.textContent || '').trim();
  manifesto.innerHTML = '';
  const wordEls = [];
  const words = raw.split(/\s+/);
  words.forEach((w, i) => {
    const span = document.createElement('span');
    span.className = 'fw-about-word';
    span.textContent = w;
    manifesto.appendChild(span);
    if (i < words.length - 1) manifesto.appendChild(document.createTextNode(' '));
    wordEls.push(span);
  });

  if (!gsap || !ST || !wordEls.length) {
    wordEls.forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
    [sign, cue].forEach(el => { if (el) { el.style.opacity = 1; el.style.transform = 'none'; } });
    return;
  }

  gsap.registerPlugin(ST);

  gsap.set(wordEls, { opacity: 0, y: 28 });
  if (sign) gsap.set(sign, { opacity: 0, y: 14 });
  if (cue)  gsap.set(cue,  { opacity: 0, y: 14 });

  const isMobile = window.innerWidth <= 900;
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

  const REVEAL_DUR = 0.16;
  const REVEAL_SPAN = 0.55;
  const stagger = wordEls.length > 1
    ? REVEAL_SPAN / (wordEls.length - 1)
    : 0;

  tl.to(wordEls, {
    opacity: 1, y: 0,
    duration: REVEAL_DUR,
    stagger,
  }, 0.10);

  if (sign) tl.to(sign, { opacity: 1, y: 0, duration: 0.10 }, 0.80);
  if (cue)  tl.to(cue,  { opacity: 1, y: 0, duration: 0.10 }, 0.88);

  // Ghost text parallax: fade in low, slide across, fade out.
  // Capped at 0.05 max so it stays background texture (not solid text).
  if (ghost) {
    gsap.set(ghost, { xPercent: 12, opacity: 0 });
    tl.to(ghost, { opacity: 0.05,  duration: 0.12, ease: 'power1.out' }, 0.04);
    tl.to(ghost, { xPercent: -32,  duration: 0.92, ease: 'none' },        0.04);
    tl.to(ghost, { opacity: 0,     duration: 0.18, ease: 'power1.in' },   0.82);
  }
}
