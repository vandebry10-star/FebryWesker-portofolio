/**
 * extras.js : Process / Stats / Now
 *
 * - Process: stagger reveal of 4 steps on enter.
 * - Stats:   count-up of 4 numeric values on enter.
 * - Now:     stagger reveal of 5 list items + left panel slide.
 */

export function initExtras() {
  initProcess();
  initStats();
  initStyleGuide();
  initNow();
}

function initProcess() {
  const gsap = window.gsap;
  const ST   = window.ScrollTrigger;
  const sec  = document.getElementById('process');
  if (!sec) return;

  const heading = sec.querySelector('.fw-process-heading');
  const steps   = sec.querySelectorAll('.fw-process-step');

  if (!gsap || !ST) {
    if (heading) heading.style.opacity = 1;
    steps.forEach((el) => { el.style.opacity = 1; el.style.transform = 'none'; });
    return;
  }

  gsap.registerPlugin(ST);

  if (heading) {
    gsap.set(heading, { opacity: 0, y: 30 });
    gsap.to(heading, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: heading,
        start: 'top 82%',
        toggleActions: 'play none none none',
      },
    });
  }

  gsap.set(steps, { opacity: 0, y: 40 });
  gsap.to(steps, {
    opacity: 1,
    y: 0,
    duration: 0.7,
    ease: 'power3.out',
    stagger: 0.12,
    scrollTrigger: {
      trigger: '.fw-process-list',
      start: 'top 78%',
      toggleActions: 'play none none none',
    },
  });
}

function initStats() {
  const gsap = window.gsap;
  const ST   = window.ScrollTrigger;
  const sec  = document.getElementById('stats');
  if (!sec) return;

  const heading = sec.querySelector('.fw-stats-heading');
  const stats   = sec.querySelectorAll('.fw-stat');
  const nums    = sec.querySelectorAll('.fw-stat-value-num');

  if (!gsap || !ST) {
    if (heading) heading.style.opacity = 1;
    stats.forEach((el) => { el.style.opacity = 1; el.style.transform = 'none'; });
    nums.forEach((el) => { el.textContent = el.dataset.target || '0'; });
    return;
  }

  gsap.registerPlugin(ST);

  if (heading) {
    gsap.set(heading, { opacity: 0, y: 30 });
    gsap.to(heading, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: heading,
        start: 'top 82%',
        toggleActions: 'play none none none',
      },
    });
  }

  gsap.set(stats, { opacity: 0, y: 40 });
  gsap.to(stats, {
    opacity: 1,
    y: 0,
    duration: 0.7,
    ease: 'power3.out',
    stagger: 0.1,
    scrollTrigger: {
      trigger: '.fw-stats-grid',
      start: 'top 78%',
      toggleActions: 'play none none none',
    },
  });

  // Count-up for each number
  nums.forEach((el) => {
    const target = parseInt(el.dataset.target || '0', 10);
    const counter = { value: 0 };
    gsap.to(counter, {
      value: target,
      duration: 1.6,
      ease: 'power3.out',
      onUpdate: () => {
        el.textContent = Math.round(counter.value);
      },
      scrollTrigger: {
        trigger: el,
        start: 'top 82%',
        toggleActions: 'play none none none',
      },
    });
  });
}

function initStyleGuide() {
  const gsap = window.gsap;
  const ST   = window.ScrollTrigger;
  const sec  = document.getElementById('style');
  if (!sec) return;

  const pin     = sec.querySelector('.fw-style-pin');
  const top     = sec.querySelector('.fw-style-top');
  const heading = sec.querySelector('.fw-style-heading');
  const swatches = sec.querySelectorAll('.fw-style-swatch');
  const types    = sec.querySelectorAll('.fw-style-type');
  const bottom   = sec.querySelector('.fw-style-bottom');

  if (!gsap || !ST || !pin) {
    [top, heading, bottom].forEach((el) => { if (el) el.style.opacity = 1; });
    swatches.forEach((el) => { el.style.opacity = 1; el.style.transform = 'none'; });
    types.forEach((el) => { el.style.opacity = 1; el.style.transform = 'none'; });
    return;
  }

  gsap.registerPlugin(ST);

  gsap.set([top, heading, bottom], { opacity: 0, y: 24 });
  gsap.set(swatches, { opacity: 0, y: 36 });
  gsap.set(types, { opacity: 0, y: 28 });

  const isMobile = window.innerWidth <= 900;

  // ── MOBILE: no pin. Flow naturally + reveal on enter. ──
  if (isMobile) {
    gsap.to(top, {
      opacity: 1, y: 0, duration: 0.6, ease: 'power3.out',
      scrollTrigger: { trigger: top, start: 'top 88%', toggleActions: 'play none none none' },
    });
    gsap.to(heading, {
      opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
      scrollTrigger: { trigger: heading, start: 'top 85%', toggleActions: 'play none none none' },
    });
    gsap.to(swatches, {
      opacity: 1, y: 0, duration: 0.55, ease: 'power3.out', stagger: 0.07,
      scrollTrigger: { trigger: '.fw-style-swatches', start: 'top 82%', toggleActions: 'play none none none' },
    });
    gsap.to(types, {
      opacity: 1, y: 0, duration: 0.55, ease: 'power3.out', stagger: 0.1,
      scrollTrigger: { trigger: '.fw-style-types', start: 'top 82%', toggleActions: 'play none none none' },
    });
    gsap.to(bottom, {
      opacity: 1, y: 0, duration: 0.5, ease: 'power3.out',
      scrollTrigger: { trigger: bottom, start: 'top 92%', toggleActions: 'play none none none' },
    });
    return;
  }

  // ── DESKTOP: pin + scrub timeline ──
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: sec,
      start: 'top top',
      end: () => `+=${window.innerHeight * 2.8}`,
      pin: pin,
      scrub: 0.6,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
    defaults: { ease: 'power2.out' },
  });

  tl.to(top,     { opacity: 1, y: 0, duration: 0.10 }, 0.08);
  tl.to(heading, { opacity: 1, y: 0, duration: 0.14 }, 0.14);

  if (swatches.length) {
    const swSpan = 0.30;
    const swStagger = swatches.length > 1 ? swSpan / (swatches.length - 1) : 0;
    tl.to(swatches, { opacity: 1, y: 0, duration: 0.18, stagger: swStagger }, 0.28);
  }

  if (types.length) {
    const tySpan = 0.20;
    const tyStagger = types.length > 1 ? tySpan / (types.length - 1) : 0;
    tl.to(types, { opacity: 1, y: 0, duration: 0.18, stagger: tyStagger }, 0.62);
  }

  tl.to(bottom, { opacity: 1, y: 0, duration: 0.12 }, 0.88);
}

function initNow() {
  const gsap = window.gsap;
  const ST   = window.ScrollTrigger;
  const sec  = document.getElementById('now');
  if (!sec) return;

  const left  = sec.querySelector('.fw-now-left');
  const items = sec.querySelectorAll('.fw-now-item');

  if (!gsap || !ST) {
    if (left) left.style.opacity = 1;
    items.forEach((el) => { el.style.opacity = 1; el.style.transform = 'none'; });
    return;
  }

  gsap.registerPlugin(ST);

  if (left) {
    gsap.set(left, { opacity: 0, x: -28 });
    gsap.to(left, {
      opacity: 1,
      x: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: sec,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });
  }

  gsap.set(items, { opacity: 0, y: 32 });
  gsap.to(items, {
    opacity: 1,
    y: 0,
    duration: 0.7,
    ease: 'power3.out',
    stagger: 0.1,
    scrollTrigger: {
      trigger: '.fw-now-list',
      start: 'top 80%',
      toggleActions: 'play none none none',
    },
  });
}
