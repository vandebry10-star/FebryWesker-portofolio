/**
 * scroll-ui.js: Global scroll affordances
 * - Scroll hint: visible on hero, fades when scroll > 80px
 * - Progress bar: vertical fill tracks Lenis scroll progress
 * - Section indicator: dots showing current section
 * - Blob parallax: drift on scroll for liveness
 * - Background tint: scroll-linked color shift per section
 */

export function initScrollUI() {
  injectDOM();

  initScrollHint();
  initProgressBar();
  initSectionIndicator();
  initBlobParallax();
  initBgTint();
}

// ══════════════════════════════════════════════
// DOM INJECTION (idempotent)
// ══════════════════════════════════════════════
function injectDOM() {
  const body = document.body;

  if (!document.querySelector('.fw-scroll-hint')) {
    const hint = document.createElement('div');
    hint.className = 'fw-scroll-hint';
    hint.innerHTML = `
      <div class="fw-scroll-hint-mouse"></div>
      <div class="fw-scroll-hint-text">Scroll</div>
    `;
    body.appendChild(hint);
  }

  if (!document.querySelector('.fw-scroll-progress')) {
    const prog = document.createElement('div');
    prog.className = 'fw-scroll-progress';
    prog.innerHTML = `
      <div class="fw-scroll-progress-fill"></div>
      <div class="fw-scroll-progress-pct">0%</div>
    `;
    body.appendChild(prog);
  }

  if (!document.querySelector('.fw-section-indicator')) {
    const ind = document.createElement('nav');
    ind.className = 'fw-section-indicator';
    ind.setAttribute('aria-label', 'Section navigation');
    const sections = [
      { id: 'home',     label: 'Home' },
      { id: 'about',    label: 'About' },
      { id: 'skills',   label: 'Skills' },
      { id: 'projects', label: 'Projects' },
      { id: 'contact',  label: 'Contact' },
    ];
    sections.forEach((s, i) => {
      const num = String(i + 1).padStart(2, '0');
      const rung = document.createElement('a');
      rung.className = 'fw-section-rung';
      rung.dataset.section = s.id;
      rung.href = '#' + s.id;
      rung.innerHTML = `
        <span class="fw-section-rung-num">${num}</span>
        <span class="fw-section-rung-bar"></span>
        <span class="fw-section-rung-label">${s.label}</span>
      `;
      ind.appendChild(rung);
    });
    body.appendChild(ind);
  }

  if (!document.querySelector('.fw-deco-layer')) {
    const layer = document.createElement('div');
    layer.className = 'fw-deco-layer';
    layer.innerHTML = `
      <div class="fw-deco-blob fw-deco-blob-1" data-speed="0.18"></div>
      <div class="fw-deco-blob fw-deco-blob-2" data-speed="-0.12"></div>
      <div class="fw-deco-blob fw-deco-blob-3" data-speed="0.22"></div>
      <div class="fw-deco-blob fw-deco-blob-4" data-speed="-0.16"></div>
      <div class="fw-deco-blob fw-deco-blob-5" data-speed="0.14"></div>
    `;
    body.appendChild(layer);
  }

  if (!document.querySelector('.fw-bg-tint')) {
    const tint = document.createElement('div');
    tint.className = 'fw-bg-tint';
    body.appendChild(tint);
  }
}

// ══════════════════════════════════════════════
// SCROLL HINT
// ══════════════════════════════════════════════
function initScrollHint() {
  const hint = document.querySelector('.fw-scroll-hint');
  if (!hint) return;

  // Show after a delay so it doesn't pop during loader exit
  setTimeout(() => hint.classList.add('is-visible'), 600);

  let hidden = false;
  const onScroll = () => {
    const y = window.scrollY;
    if (!hidden && y > 80) {
      hint.classList.add('is-hidden');
      hidden = true;
    } else if (hidden && y < 40) {
      hint.classList.remove('is-hidden');
      hidden = false;
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
}

// ══════════════════════════════════════════════
// PROGRESS BAR
// ══════════════════════════════════════════════
function initProgressBar() {
  const prog = document.querySelector('.fw-scroll-progress');
  if (!prog) return;
  const fill = prog.querySelector('.fw-scroll-progress-fill');
  const pct  = prog.querySelector('.fw-scroll-progress-pct');

  fill.style.transformOrigin = 'top center';
  fill.style.height = '100%';

  let lastPct = -1;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (max <= 0) return;
    const ratio = Math.min(1, Math.max(0, window.scrollY / max));
    const p = Math.round(ratio * 100);
    fill.style.transform = `scaleY(${ratio.toFixed(4)})`;
    if (p !== lastPct) {
      if (pct) pct.textContent = p + '%';
      lastPct = p;
    }
  };

  // Show after first scroll
  let shown = false;
  const show = () => {
    if (shown) return;
    if (window.scrollY > 40) {
      prog.classList.add('is-active');
      shown = true;
    }
  };

  window.addEventListener('scroll', () => {
    update();
    show();
  }, { passive: true });
  update();
}

// ══════════════════════════════════════════════
// SECTION INDICATOR
// ══════════════════════════════════════════════
function initSectionIndicator() {
  const ind = document.querySelector('.fw-section-indicator');
  if (!ind) return;
  const rungs = ind.querySelectorAll('.fw-section-rung');
  const ids   = Array.from(rungs).map((r) => r.dataset.section);

  // Auto-hide rail: muncul saat scroll/hover, fade out kalau idle.
  // Bikin gak annoying karena gak ngotot ada terus.
  let idleTimer;
  const wake = (holdMs = 2200) => {
    ind.classList.add('is-active');
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => ind.classList.remove('is-active'), holdMs);
  };

  // Cache offsetTop di refresh, bukan tiap scroll : offsetTop = layout query.
  let cached = [];
  const refreshOffsets = () => {
    cached = ids.map(id => {
      const el = document.getElementById(id);
      return { id, top: el ? el.offsetTop : 0 };
    });
  };
  refreshOffsets();
  window.addEventListener('resize', refreshOffsets, { passive: true });

  let lastId = null;
  const update = () => {
    let currentId = cached[0]?.id;
    const y = window.scrollY;
    for (const c of cached) {
      if (y >= c.top - 200) currentId = c.id;
    }
    if (currentId === lastId) return;
    lastId = currentId;
    rungs.forEach((r) => {
      r.classList.toggle('is-current', r.dataset.section === currentId);
    });
  };

  let scrollPending = false;
  window.addEventListener('scroll', () => {
    if (!scrollPending) {
      scrollPending = true;
      requestAnimationFrame(() => {
        update();
        scrollPending = false;
      });
    }
    wake();
  }, { passive: true });

  ind.addEventListener('mouseenter', () => {
    ind.classList.add('is-active');
    clearTimeout(idleTimer);
  });
  ind.addEventListener('mouseleave', () => {
    idleTimer = setTimeout(() => ind.classList.remove('is-active'), 900);
  });

  // Smooth scroll on click (uses Lenis if available)
  rungs.forEach((rung) => {
    rung.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(rung.dataset.section);
      if (!target) return;
      wake(1500);
      if (window.__lenis) {
        window.__lenis.scrollTo(target, { offset: -60, duration: 1.2 });
      } else {
        window.scrollTo({ top: target.offsetTop - 60, behavior: 'smooth' });
      }
    });
  });

  update();
  // Initial hint flash supaya user tau ada navigasi di sini
  setTimeout(() => wake(1600), 900);
}

// ══════════════════════════════════════════════
// BLOB PARALLAX
// ══════════════════════════════════════════════
function initBlobParallax() {
  const blobs = document.querySelectorAll('.fw-deco-blob');
  if (!blobs.length) return;

  // Cache initial positions and speeds
  const items = Array.from(blobs).map((el) => ({
    el,
    speed: parseFloat(el.dataset.speed || '0.1'),
  }));

  let raf = null;
  let pending = false;

  const update = () => {
    const y = window.scrollY;
    items.forEach((it) => {
      const offset = y * it.speed;
      it.el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
    });
    pending = false;
  };

  window.addEventListener('scroll', () => {
    if (!pending) {
      pending = true;
      raf = requestAnimationFrame(update);
    }
  }, { passive: true });

  update();
}

// ══════════════════════════════════════════════
// BG TINT (scroll-linked color shift)
// ══════════════════════════════════════════════
function initBgTint() {
  const tint = document.querySelector('.fw-bg-tint');
  if (!tint) return;

  // Per-section accent color pairs
  const stops = [
    { id: 'home',     a: 'rgba(139,92,246,0.08)', b: 'rgba(96,165,250,0.04)' },
    { id: 'about',    a: 'rgba(168,85,247,0.10)', b: 'rgba(139,92,246,0.06)' },
    { id: 'skills',   a: 'rgba(96,165,250,0.10)', b: 'rgba(34,197,94,0.06)' },
    { id: 'projects', a: 'rgba(236,72,153,0.10)', b: 'rgba(139,92,246,0.08)' },
    { id: 'contact',  a: 'rgba(34,197,94,0.08)',  b: 'rgba(96,165,250,0.06)' },
  ];

  // Cache offsetTop + skip update kalau section tidak berubah :
  // sebelumnya set background gradient string tiap scroll event,
  // fullpage repaint mahal.
  let cached = [];
  const refreshOffsets = () => {
    cached = stops.map(s => {
      const el = document.getElementById(s.id);
      return { ...s, top: el ? el.offsetTop : 0 };
    });
  };
  refreshOffsets();
  window.addEventListener('resize', refreshOffsets, { passive: true });

  let lastIdx = -1;
  let pending = false;
  const update = () => {
    let currentIdx = 0;
    const y = window.scrollY;
    for (let i = 0; i < cached.length; i++) {
      if (y >= cached[i].top - 200) currentIdx = i;
    }
    pending = false;
    if (currentIdx === lastIdx) return;
    lastIdx = currentIdx;
    const s = cached[currentIdx];
    tint.style.background = `linear-gradient(180deg, ${s.a} 0%, ${s.b} 100%)`;
  };

  window.addEventListener('scroll', () => {
    if (!pending) {
      pending = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });

  update();
}
