/**
 * hero.js : editorial cream hero
 *
 * Build hero DOM is already in markup. JS handles:
 *  - lanyard strap rendering + spring physics (drag/release)
 *  - scroll-linked outro fade
 *  - reveal trigger called by main.js after loader exits
 */

let lanyardKick = null;
let heroSectionEl = null;

export function initHero() {
  heroSectionEl = document.getElementById('home');
  lanyardKick = initLanyard();
  initHeroScrollOutro();
}

// Called by main.js immediately after the loader curtain finishes.
// Triggers staged CSS reveal + kicks the lanyard swing.
export function revealHero() {
  if (heroSectionEl) heroSectionEl.classList.add('is-ready');
  if (typeof lanyardKick === 'function') {
    setTimeout(lanyardKick, 520);
  }
}

// ── Scroll-linked outro : fade hero out as user scrolls into about ──
function initHeroScrollOutro() {
  const gsap = window.gsap;
  const ST   = window.ScrollTrigger;
  if (!gsap || !ST) return;

  const home    = document.getElementById('home');
  const display = document.querySelector('.fw-hero-display');
  const lany    = document.querySelector('.fw-lanyard-scene');
  if (!home || !display) return;

  gsap.registerPlugin(ST);

  gsap.to(display, {
    yPercent: -14,
    opacity: 0.18,
    ease: 'none',
    scrollTrigger: {
      trigger: home,
      start: 'top top',
      end: 'bottom 35%',
      scrub: 0.6,
    },
  });

  if (lany) {
    // fromTo + immediateRender:false supaya GSAP tidak override CSS reveal
    // (opacity 0 -> 1) sebelum user benar-benar scroll lewat trigger range.
    gsap.fromTo(lany,
      { opacity: 1 },
      {
        opacity: 0.35,
        ease: 'none',
        immediateRender: false,
        scrollTrigger: {
          trigger: home,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.7,
        },
      }
    );
  }
}

// ════════════════════════════════════════════
// LANYARD : strap rendering + physics
// ════════════════════════════════════════════
function initLanyard() {
  const scene = document.getElementById('lanyard-scene');
  const card  = document.getElementById('lanyard-card');
  const svg   = document.getElementById('lanyard-svg');
  const ropeL = document.getElementById('l-rope-L');
  const ropeR = document.getElementById('l-rope-R');
  const dring = document.getElementById('l-dring');
  if (!scene || !card || !svg || !ropeL || !ropeR || !dring) return null;

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const PIN_Y = isMobile ? 8 : -68;
  const ROPE  = isMobile ? 110 : 200;
  const K = 0.06, DAMP = 0.88;

  let W, CW, rx, ry;
  let x = 0, y = 0, vx = 0, vy = 0;
  let dragging = false, rafId = null;
  let ox = 0, oy = 0, pmx = 0, pmy = 0;
  let _strapL = '', _strapR = '';

  function measure() {
    W  = scene.offsetWidth  || 220;
    CW = card.offsetWidth   || 200;
    rx = (W - CW) / 2;
    ry = PIN_Y + ROPE;

    // Make sure scene tall enough to host strap + card
    const sceneH = ry + card.offsetHeight + 24;
    if (sceneH > scene.offsetHeight) {
      scene.style.height = sceneH + 'px';
    }

    place(); strap();
  }

  function place() {
    card.style.left = (rx + x) + 'px';
    card.style.top  = (ry + y) + 'px';
  }

  function strap() {
    const cxs    = W / 2;
    const SPREAD = Math.min(56, W * 0.26);
    const ax_L   = (cxs - SPREAD) | 0;
    const ax_R   = (cxs + SPREAD) | 0;
    const cx     = (rx + x + CW / 2) | 0;
    const cy     = (ry + y) | 0;
    const hookY  = cy - 5;

    const dxL = cx - ax_L, dyL = hookY - PIN_Y;
    const sagL = Math.max(6, Math.min(28, Math.abs(dxL) * 0.10 + 6));
    const dL = `M${ax_L} ${PIN_Y} Q${(ax_L + dxL*0.30)|0} ${(PIN_Y + dyL*0.55 + sagL)|0} ${cx} ${hookY}`;

    const dxR = cx - ax_R, dyR = hookY - PIN_Y;
    const sagR = Math.max(6, Math.min(28, Math.abs(dxR) * 0.10 + 6));
    const dR = `M${ax_R} ${PIN_Y} Q${(ax_R + dxR*0.30)|0} ${(PIN_Y + dyR*0.55 + sagR)|0} ${cx} ${hookY}`;

    if (dL !== _strapL) { _strapL = dL; ropeL.setAttribute('d', dL); }
    if (dR !== _strapR) { _strapR = dR; ropeR.setAttribute('d', dR); }
    dring.setAttribute('transform', `translate(${cx} ${hookY})`);
  }

  function setRot(deg) {
    card.style.transform = `rotate(${Math.max(-16, Math.min(16, deg)).toFixed(1)}deg)`;
  }

  function physics() {
    if (dragging) return;
    vx += -K * x; vy += -K * y;
    vx *= DAMP;   vy *= DAMP;
    x  += vx;     y  += vy;
    setRot(x * 0.05); place(); strap();

    if (Math.abs(vx) < 0.05 && Math.abs(vy) < 0.05 &&
        Math.abs(x) < 0.5 && Math.abs(y) < 0.5) {
      x = 0; y = 0; vx = 0; vy = 0;
      setRot(0); place(); strap();
      rafId = null;
    } else {
      rafId = requestAnimationFrame(physics);
    }
  }

  function kick() {
    if (!rafId) rafId = requestAnimationFrame(physics);
  }

  function pt(e) {
    return e.touches
      ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
      : { x: e.clientX, y: e.clientY };
  }

  function onDown(e) {
    if (e.button && e.button !== 0) return;
    e.preventDefault();
    dragging = true;
    cancelAnimationFrame(rafId);
    rafId = null;
    card.style.willChange = 'left, top, transform';
    const p = pt(e);
    const r = card.getBoundingClientRect();
    ox = p.x - r.left;
    oy = p.y - r.top;
    pmx = p.x; pmy = p.y;
    vx = 0; vy = 0;
    card.style.cursor = 'grabbing';

    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchend', onUp);
  }

  function onMove(e) {
    if (!dragging) return;
    e.preventDefault();
    const p = pt(e);
    const sr = scene.getBoundingClientRect();
    vx = vx * 0.25 + (p.x - pmx) * 0.75;
    vy = vy * 0.25 + (p.y - pmy) * 0.75;
    pmx = p.x; pmy = p.y;
    x = p.x - sr.left - ox - rx;
    y = p.y - sr.top  - oy - ry;
    setRot(vx * 2); place(); strap();
  }

  function onUp() {
    if (!dragging) return;
    dragging = false;
    card.style.cursor = 'grab';
    card.style.willChange = 'auto';
    kick();
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('mouseup', onUp);
    document.removeEventListener('touchend', onUp);
  }

  card.addEventListener('mousedown', onDown);
  card.addEventListener('touchstart', onDown, { passive: false });

  measure();
  window.addEventListener('resize', () => {
    if (!dragging) { x = 0; y = 0; vx = 0; vy = 0; }
    measure();
  });

  // Pause physics when hero out of view
  const heroSection = document.getElementById('home');
  if (heroSection && 'IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          cancelAnimationFrame(rafId);
          rafId = null;
        } else {
          kick();
        }
      });
    }, { threshold: 0.05 }).observe(heroSection);
  }

  // Park card slightly off-rest until revealHero() triggers swing
  x = 60;
  y = -16;
  setRot(-8);
  place(); strap();

  // Returns the kick fn so main.js / revealHero can fire it.
  return function lanyardSwingIn() {
    if (window.gsap) {
      const state = { x, y, rot: -8 };
      window.gsap.to(state, {
        x: 0, y: 0, rot: 0,
        duration: 1.5,
        ease: 'elastic.out(1.0, 0.5)',
        onUpdate: () => {
          x = state.x; y = state.y;
          card.style.transform = `rotate(${state.rot.toFixed(2)}deg)`;
          place(); strap();
        },
        onComplete: () => {
          x = 0; y = 0; vx = 0; vy = 0;
          setRot(0); place(); strap();
        },
      });
    } else {
      vx = -4; vy = 0;
      x = 0; y = 0;
      place(); strap(); kick();
    }
  };
}
