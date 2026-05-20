/**
 * hero.js v9.0
 *
 * Fixes:
 * - Name animation glitch: hapus fw-hero-name-landing yang bikin
 *   brightness flash lalu fadeInUp replay dari bawah
 * - Desktop hint text di sebelah nama: "← hover to reveal"
 * - Card auto-flip balik ke depan setelah 2 detik
 */

/**
 * @param {Object} [opts]
 * @param {boolean} [opts.manualReveal] - Jika true, hero di-build tapi
 *   semua animasi/interaktif ditunda. Caller harus panggil revealCascade()
 *   dan showHeroName() lewat controller yang di-return.
 * @returns {Object|null} controller jika manualReveal=true, null jika auto.
 */
export function initHero(opts = {}) {
  const manual = opts.manualReveal === true;

  initStatusInteractive();
  initHeroScrollOutro();

  // initNameHover dipanggil duluan supaya .fw-hero-name di-wrap dalam
  // .fw-name-row dan tgtRect untuk FLIP sudah akurat.
  initNameHover();

  // initLanyard SELALU async (build DOM, measure, init physics).
  const lanyardReady = initLanyard({ delayed: manual });

  if (!manual) {
    initTyping();
    initXpBar();
    return null;
  }

  // Manual mode: hide hero content sampai revealCascade dipanggil.
  const heroContent = document.querySelector('.fw-hero-content');
  if (heroContent) {
    heroContent.querySelectorAll(':scope > *').forEach(el => {
      el.style.animation = 'none';
      el.style.opacity = '0';
      // Jangan translate .fw-name-row supaya posisi hero name tetap akurat
      // sebagai target FLIP.
      if (!el.classList.contains('fw-name-row')) {
        el.style.transform = 'translateY(18px)';
      }
    });
  }
  const visual = document.querySelector('.fw-hero-visual');
  if (visual) {
    visual.style.animation = 'none';
    visual.style.opacity = '0';
  }
  const fill = document.getElementById('xp-fill');
  if (fill) {
    fill.style.animation = 'none';
    fill.style.width = '0%';
  }

  const heroNameEl = document.getElementById('hero-name-text');

  return {
    heroNameEl,

    showHeroName() {
      const row = document.querySelector('.fw-name-row');
      if (row) row.style.opacity = '1';
      const nameWrap = document.querySelector('.fw-hero-name');
      if (nameWrap) {
        nameWrap.style.opacity = '1';
      }
      if (heroNameEl) {
        heroNameEl.style.visibility = 'visible';
      }
    },

    revealCascade() {
      const gsap = window.gsap;

      // Reveal lanyard scene container (card masih off-screen sampai drop)
      if (visual) {
        if (gsap) {
          gsap.to(visual, { opacity: 1, duration: 0.4, ease: 'power2.out' });
        } else {
          visual.style.transition = 'opacity 0.45s ease';
          visual.style.opacity = '1';
        }
      }

      // Cascade hero content (kecuali .fw-name-row, sudah ditangani FLIP)
      const items = heroContent
        ? Array.from(heroContent.querySelectorAll(':scope > *'))
            .filter(el => !el.classList.contains('fw-name-row'))
        : [];

      if (gsap && items.length) {
        gsap.fromTo(items,
          { opacity: 0, y: 24 },
          {
            opacity: 1, y: 0,
            duration: 0.9,
            ease: 'power2.out',
            stagger: 0.11,
          }
        );
      } else {
        items.forEach((el, i) => {
          setTimeout(() => {
            el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          }, i * 85);
        });
      }

      // Kick typing + xp setelah elemen mulai muncul
      setTimeout(() => {
        initTyping();
        initXpBar();
      }, 300);

      // Swing lanyard card masuk dari pojok kanan
      setTimeout(async () => {
        const ctrl = await lanyardReady;
        if (ctrl && typeof ctrl.revealCard === 'function') {
          ctrl.revealCard();
        }
      }, 380);
    },
  };
}

// ── HERO SCROLL OUTRO ────────────────────────────
// Scroll-linked fade + parallax saat user scroll dari home ke about.
// Content side bergerak lebih cepat dari visual side untuk efek depth.
function initHeroScrollOutro() {
  const gsap = window.gsap;
  const ST   = window.ScrollTrigger;
  if (!gsap || !ST) return;

  const home    = document.getElementById('home');
  const content = document.querySelector('.fw-hero-content');
  const visual  = document.querySelector('.fw-hero-visual');
  if (!home || !content || !visual) return;

  gsap.registerPlugin(ST);

  // Content: fade + geser ke atas.
  // Pakai yPercent (composited) bukan y (px) supaya tidak trigger layout.
  gsap.to(content, {
    yPercent: -12,
    opacity: 0.15,
    ease: 'none',
    scrollTrigger: {
      trigger: home,
      start: 'top top',
      end: 'bottom 40%',
      scrub: 0.5,
    },
  });

  // Visual: hanya opacity scrub.
  // Sebelumnya y + scale + opacity, scale bikin shadow 5-lapis card
  // re-rasterize tiap frame -> frame drop parah saat scroll hero.
  gsap.to(visual, {
    opacity: 0.4,
    ease: 'none',
    scrollTrigger: {
      trigger: home,
      start: 'top top',
      end: 'bottom top',
      scrub: 0.7,
    },
  });
}

// ── TYPING ────────────────────────────────────
function initTyping() {
  const el = document.getElementById('typing');
  if (!el) return;
  const phrases = [
    'Web Game Developer', 'WhatsApp Bot Creator', 'UI/UX Designer',
    'Full Stack Developer', 'REST API Builder', 'Problem Solver',
  ];
  let pi = 0, ci = 0, del = false;
  function tick() {
    const p = phrases[pi];
    el.textContent = del ? p.slice(0, ci - 1) : p.slice(0, ci + 1);
    del ? ci-- : ci++;
    if (!del && ci === p.length) { setTimeout(() => { del = true; tick(); }, 2000); return; }
    if (del && ci === 0) { del = false; pi = (pi + 1) % phrases.length; setTimeout(tick, 500); return; }
    setTimeout(tick, del ? 45 : 90);
  }
  tick();
}

// ── XP BAR ────────────────────────────────────
function initXpBar() {
  const fill = document.getElementById('xp-fill');
  if (!fill) return;
  fill.style.transition = 'none';
  fill.style.width = '0%';
  requestAnimationFrame(() => setTimeout(() => {
    fill.style.transition = 'width 1.6s cubic-bezier(0.4,0,0.2,1)';
    fill.style.width = '74%';
  }, 700));
}

// ── NAME HOVER : peephole + hint text ─────────
//
// Fix: sebelumnya fw-hero-name-landing (animation brightness 2 + !important)
// di-apply setelah loader keluar, lalu saat class dihapus browser restart
// animasi fadeInUp → efek "bright trus fade dari bawah". Sekarang tidak ada
// landing animation : hero sudah selesai render di balik loader.
//
// Baru: hint text "← hover to reveal" di sebelah kanan nama (desktop only).
// Wrap h1 + hint dalam flex row supaya sejajar.

function initNameHover() {
  const wrapper  = document.querySelector('.fw-hero-name');
  const nameSpan = document.getElementById('hero-name-text');
  if (!wrapper || !nameSpan) return;

  // ── Inject styles once ──
  if (!document.getElementById('fw-peep-style')) {
    const st = document.createElement('style');
    st.id = 'fw-peep-style';
    st.textContent = `
      /* ── Name row: h1 + hint sejajar ── */
      .fw-name-row {
        display: flex;
        align-items: center;
        gap: 18px;
        margin-bottom: 8px;  /* ganti margin-bottom h1 */
      }
      .fw-hero-name {
        /* overrides dari hero.css */
        margin-bottom: 0 !important;
        position: relative !important;
        display: inline-block !important;
        cursor: crosshair !important;
        overflow: visible !important;
      }

      /* ── Hint text (desktop only) ── */
      .fw-name-hint-txt {
        font-family: var(--font-mono, monospace);
        font-size: 9px;
        font-weight: 400;
        color: rgba(255,255,255,0.22);
        letter-spacing: 0.13em;
        white-space: nowrap;
        user-select: none;
        flex-shrink: 0;
        pointer-events: none;
        /* Pulsing agar menarik perhatian */
        animation: hintPulse 3.8s ease-in-out infinite;
        transition: opacity 0.3s ease;
      }
      .fw-name-hint-txt.hidden { opacity: 0 !important; animation: none !important; }
      @keyframes hintPulse {
        0%, 100% { opacity: 0.18; }
        50%       { opacity: 0.55; }
      }
      @media (max-width: 768px) {
        .fw-name-row { justify-content: center; }
        .fw-name-hint-txt { display: none; }
        /* Matikan breathe pada status dot di mobile */
        .fw-card-online::before { animation: none; opacity: 1; }
      }

      /* ── Peephole layers ── */
      .fw-name-alias-bg {
        position: absolute;
        top: 0; left: 0;
        pointer-events: none;
        z-index: 1;
        font-family: var(--font-display, serif);
        font-weight: 900;
        font-size: inherit;
        line-height: inherit;
        letter-spacing: -0.04em;
        white-space: nowrap;
        background: linear-gradient(135deg, #fde68a 0%, #f9a8d4 45%, #c4b5fd 75%, #67e8f9 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        -webkit-mask-image: radial-gradient(circle 0px at -999px -999px, black 0%, transparent 0%);
        mask-image:         radial-gradient(circle 0px at -999px -999px, black 0%, transparent 0%);
        will-change: -webkit-mask-image, mask-image;
      }
      #hero-name-text {
        display: block;
        position: relative;
        z-index: 2;
        background: var(--grad-text);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        will-change: -webkit-mask-image, mask-image;
      }

      /* ── Cursor ring ── */
      .fw-peep-ring {
        position: fixed;
        width: 80px; height: 80px;
        border-radius: 50%;
        pointer-events: none;
        z-index: 9997;
        border: 1.5px solid rgba(253,230,138,0.45);
        transform: translate(-50%,-50%) scale(0);
        transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease;
        opacity: 0;
      }
      .fw-peep-ring.visible {
        transform: translate(-50%,-50%) scale(1);
        opacity: 1;
      }
    `;
    document.head.appendChild(st);
  }

  // ── Wrap h1 dalam flex row (sekali saja) ──
  let hintEl = null;
  if (!wrapper.parentNode.classList.contains('fw-name-row')) {
    const row = document.createElement('div');
    row.className = 'fw-name-row';
    wrapper.parentNode.insertBefore(row, wrapper);
    row.appendChild(wrapper);

    hintEl = document.createElement('span');
    hintEl.className = 'fw-name-hint-txt';
    hintEl.textContent = '← hover to reveal';
    row.appendChild(hintEl);
  }

  // ── Alias layer (D. Febriari) ──
  const alias = document.createElement('span');
  alias.className = 'fw-name-alias-bg';
  alias.textContent = 'D. Febriari';
  wrapper.insertBefore(alias, nameSpan);

  function syncSize() {
    const r = nameSpan.getBoundingClientRect();
    alias.style.width  = r.width  + 'px';
    alias.style.height = r.height + 'px';
  }
  requestAnimationFrame(syncSize);
  window.addEventListener('resize', syncSize);

  // ── Cursor ring ──
  const ring = document.createElement('div');
  ring.className = 'fw-peep-ring';
  document.body.appendChild(ring);

  const RING_R = 40;
  let radius = 0, targetR = 0, raf = null;
  let cx = -999, cy = -999;

  function applyMask() {
    if (radius < 1) {
      nameSpan.style.webkitMaskImage = '';
      nameSpan.style.maskImage = '';
    } else {
      const mask = `radial-gradient(circle ${radius.toFixed(1)}px at ${cx}px ${cy}px, transparent ${(radius * 0.95).toFixed(1)}px, black ${(radius * 1.05).toFixed(1)}px)`;
      nameSpan.style.webkitMaskImage = mask;
      nameSpan.style.maskImage = mask;
    }
    const aliasMask = `radial-gradient(circle ${radius.toFixed(1)}px at ${cx}px ${cy}px, black ${(radius * 0.95).toFixed(1)}px, transparent ${(radius * 1.05).toFixed(1)}px)`;
    alias.style.webkitMaskImage = aliasMask;
    alias.style.maskImage = aliasMask;
  }

  function animR() {
    cancelAnimationFrame(raf);
    (function step() {
      const d = targetR - radius;
      if (Math.abs(d) < 0.5) { radius = targetR; applyMask(); return; }
      radius += d * 0.15;
      applyMask();
      raf = requestAnimationFrame(step);
    })();
  }

  wrapper.addEventListener('mouseenter', () => {
    ring.classList.add('visible');
    targetR = RING_R; animR();
    if (hintEl) hintEl.classList.add('hidden');
  });
  wrapper.addEventListener('mouseleave', () => {
    ring.classList.remove('visible');
    targetR = 0; animR();
    cx = -999; cy = -999;
    if (hintEl) hintEl.classList.remove('hidden');
  });
  wrapper.addEventListener('mousemove', e => {
    const r = nameSpan.getBoundingClientRect();
    cx = e.clientX - r.left;
    cy = e.clientY - r.top;
    ring.style.left = e.clientX + 'px';
    ring.style.top  = e.clientY + 'px';
    // Throttle applyMask : tidak perlu tiap pixel
    if (!applyMask._raf) {
      applyMask._raf = requestAnimationFrame(() => {
        applyMask();
        applyMask._raf = null;
      });
    }
  });
}

// ── STATUS INTERACTIVE ────────────────────────
function initStatusInteractive() {
  const el = document.querySelector('.fw-info-val.online');
  if (!el) return;
  const states = [
    { text: '● Active',    color: '#22c55e' },
    { text: '● Coding',    color: '#60a5fa' },
    { text: '● Designing', color: '#a78bfa' },
    { text: '● Building',  color: '#fb923c' },
  ];
  let idx = 0;
  el.style.cssText += ';cursor:pointer;transition:opacity 0.15s,color 0.3s;';

  function cycle() {
    idx = (idx + 1) % states.length;
    const s = states[idx];
    el.style.opacity = '0';
    setTimeout(() => { el.textContent = s.text; el.style.color = s.color; el.style.opacity = '1'; }, 120);
  }
  el.addEventListener('click', cycle);
  setInterval(() => { if (!document.hidden) cycle(); }, 4000);
}

// ── LANYARD ───────────────────────────────────
/**
 * @param {Object} [opts]
 * @param {boolean} [opts.delayed] - Jika true, card di-park di luar viewport
 *   dan physics tidak di-kick auto. Caller harus panggil revealCard().
 * @returns {Promise<{revealCard: Function}>}
 */
function initLanyard(opts = {}) {
  return new Promise((resolve) => {
    const scene = document.getElementById('lanyard-scene');
    const card  = document.getElementById('lanyard-card');
    const svg   = document.getElementById('lanyard-svg');
    if (!scene || !card || !svg) { resolve(null); return; }

    const ropeL = document.getElementById('l-rope-L');
    const ropeR = document.getElementById('l-rope-R');
    const dring = document.getElementById('l-dring');
    if (!ropeL || !ropeR || !dring) { resolve(null); return; }

    initLanyardImpl(scene, card, svg, ropeL, ropeR, dring, opts, resolve);
  });
}

function initLanyardImpl(scene, card, svg, ropeL, ropeR, dring, opts, resolve) {

  if (!document.getElementById('fw-flip-css')) {
    const st = document.createElement('style');
    st.id = 'fw-flip-css';
    st.textContent = `
      .fw-flipper {
        width: 100%; height: 100%;
        position: relative;
        transform-style: preserve-3d;
        transition: transform 0.6s cubic-bezier(0.4,0,0.2,1);
        transform-origin: 50% 0;
      }
      .fw-flipper.flipped { transform: rotateY(180deg); }
      .fw-face {
        position: absolute; inset: 0;
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
        border-radius: 20px;
        overflow: hidden;
      }
      .fw-face-back {
        transform: rotateY(180deg);
        background: linear-gradient(145deg, #0d0820, #130c2e);
        border: 1px solid rgba(139,92,246,0.25);
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        gap: 12px; padding: 20px;
      }
      @keyframes fw-wiggle {
        0%,100% { transform: rotateY(0deg); }
        30%      { transform: rotateY(16deg); }
        70%      { transform: rotateY(-6deg); }
      }
      .fw-flipper.wiggling { animation: fw-wiggle 0.85s ease-in-out; }

      .fw-card-online {
        display: inline-flex; align-items: center; gap: 4px;
        font-family: var(--font-mono, monospace);
        font-size: 8px; font-weight: 600;
        color: #22c55e;
        letter-spacing: 0.10em; text-transform: uppercase;
        background: rgba(34,197,94,0.07);
        border: 1px solid rgba(34,197,94,0.18);
        border-radius: 99px;
        padding: 2px 8px;
        margin: 6px auto 8px;
        width: fit-content;
      }
      .fw-card-online::before {
        content: '';
        width: 5px; height: 5px;
        border-radius: 50%;
        background: #22c55e;
        box-shadow: 0 0 6px #22c55e;
        animation: breathe 2s ease-in-out infinite;
      }
      @media (max-width: 768px) {
        .fw-card-online::before { animation: none; }
      }

      /* Label "flip back" di belakang card */
      .fw-back-timer {
        font-family: var(--font-mono, monospace);
        font-size: 9px;
        color: rgba(255,255,255,0.2);
        letter-spacing: 0.12em;
        margin-top: 4px;
      }
    `;
    document.head.appendChild(st);
  }

  const origHTML = card.innerHTML;

  card.style.cssText = `
    position: absolute; left: 0; top: 0;
    z-index: 2; cursor: grab;
    transform-origin: 50% 0;
    will-change: auto;
    user-select: none; -webkit-user-select: none;
    perspective: 800px;
    width: 260px; height: auto;
    overflow: visible; padding: 0;
    background: transparent; border: none;
    box-shadow: none; backdrop-filter: none; -webkit-backdrop-filter: none;
  `;

  const flipper = document.createElement('div');
  flipper.className = 'fw-flipper';

  const front = document.createElement('div');
  front.className = 'fw-face';
  front.style.cssText = `
    position: relative;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(139,92,246,0.12);
    padding: 20px 24px 24px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  `;

  front.innerHTML = origHTML;

  const back = document.createElement('div');
  back.className = 'fw-face fw-face-back';
  back.innerHTML = `
    <div style="position:absolute;inset:0;border-radius:20px;pointer-events:none;
      background:repeating-linear-gradient(0deg,transparent,transparent 28px,rgba(139,92,246,0.03) 29px);"></div>
    <div style="width:100px;height:100px;border-radius:14px;overflow:hidden;flex-shrink:0;
      border:2px solid rgba(139,92,246,0.4);box-shadow:0 0 20px rgba(139,92,246,0.2);
      background:rgba(139,92,246,0.08);">
      <img src="./js/itugwjir.jpg" style="width:100%;height:100%;object-fit:cover;display:block;"
           onerror="this.style.display='none'"/>
    </div>
    <div style="text-align:center;">
      <div style="font-family:var(--font-display,sans-serif);font-size:14px;font-weight:800;
        color:white;letter-spacing:-0.02em;margin-bottom:2px;">FebryWesker</div>
      <div style="font-size:10px;color:rgba(255,255,255,0.35);letter-spacing:0.1em;text-transform:uppercase;">
        "ideas don't build themselves.</div>
    </div>
    <div style="padding:4px 12px;border-radius:7px;font-size:9px;font-family:monospace;
      letter-spacing:0.08em;color:rgba(255,255,255,0.4);
      background:rgba(139,92,246,0.12);border:1px solid rgba(139,92,246,0.22);">
      @vandebry10-star</div>
    <div class="fw-back-timer" id="fw-flip-timer">flipping back in 2s…</div>
  `;

  flipper.appendChild(front);
  flipper.appendChild(back);
  card.innerHTML = '';
  card.appendChild(flipper);

  // Badge di bawah avatar
  requestAnimationFrame(() => {
    const avatarImg = front.querySelector('.fw-avatar-img') || front.querySelector('img');
    if (avatarImg) {
      const badge = document.createElement('div');
      badge.className = 'fw-card-online';
      badge.textContent = 'Online';
      avatarImg.parentNode.insertBefore(badge, avatarImg.nextSibling);
    }
  });

  requestAnimationFrame(() => requestAnimationFrame(() => {
    front.style.position = 'relative';
    const h = Math.max(front.scrollHeight, 300);
    front.style.position = '';
    card.style.height    = h + 'px';
    flipper.style.height = h + 'px';
    // ry in physics = PIN_Y(18) + ROPE(130) = 148. Total = ry + h + buffer.
    scene.style.height   = (148 + h + 20) + 'px';
    const revealCard = initPhysics(scene, card, svg, ropeL, ropeR, dring, flipper, opts);
    resolve({ revealCard });
  }));

  const hint = document.createElement('p');
  hint.style.cssText = `text-align:center;font-size:9px;letter-spacing:0.05em;
    color:rgba(255,255,255,0.16);font-family:monospace;margin-top:6px;user-select:none;`;
  hint.textContent = '↔ drag right or double tap for flip';
  scene.after(hint);
}

function initPhysics(scene, card, svg, ropeL, ropeR, dring, flipper, opts = {}) {
  // Desktop: anchor extends well above the scene so the strap appears to
  // continue up behind the navbar. Mobile: anchor sits inside the scene,
  // hidden by the ::before fade overlay in the row-gap. Card rest position
  // (ry = PIN_Y + ROPE) is kept constant across viewports.
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const PIN_Y = isMobile ? 18 : -82;
  const ROPE  = isMobile ? 130 : 230;
  const K = 0.06, DAMP = 0.88;

  let W, CW, rx, ry;
  let x = 0, y = 0, vx = 0, vy = 0;
  let dragging = false, rafId = null;
  let ox = 0, oy = 0, pmx = 0, pmy = 0;
  let isFlipped = false, flipLocked = false;
  let dragDX = 0, dragT = 0;
  let idleTimer = null;
  let autoFlipTimer = null;   // ← auto-flip back timer
  let _strapL = '', _strapR = '';

  const timerLabel = document.getElementById('fw-flip-timer');

  function measure() {
    W  = scene.offsetWidth  || 280;
    CW = card.offsetWidth   || 260;
    rx = (W - CW) / 2;
    ry = PIN_Y + ROPE;
    place(); strap();
  }

  function place() {
    card.style.left = (rx + x) + 'px';
    card.style.top  = (ry + y) + 'px';
  }

  function strap() {
    const cxs    = W / 2;
    // Anchor points at the top of the visible scene, spread wider for thicker straps
    const SPREAD = Math.min(72, W * 0.28);
    const ax_L   = (cxs - SPREAD) | 0;
    const ax_R   = (cxs + SPREAD) | 0;
    const cx     = (rx + x + CW / 2) | 0;
    const cy     = (ry + y) | 0;
    // D-ring sits just above the card clip
    const hookY  = cy - 6;

    // Left strand: from offscreen anchor down to D-ring center
    const dxL = cx - ax_L, dyL = hookY - PIN_Y;
    const sagL = Math.max(8, Math.min(32, Math.abs(dxL) * 0.10 + 8));
    const dL = `M${ax_L} ${PIN_Y} Q${(ax_L + dxL*0.30)|0} ${(PIN_Y + dyL*0.55 + sagL)|0} ${cx} ${hookY}`;

    // Right strand: from offscreen anchor down to D-ring center
    const dxR = cx - ax_R, dyR = hookY - PIN_Y;
    const sagR = Math.max(8, Math.min(32, Math.abs(dxR) * 0.10 + 8));
    const dR = `M${ax_R} ${PIN_Y} Q${(ax_R + dxR*0.30)|0} ${(PIN_Y + dyR*0.55 + sagR)|0} ${cx} ${hookY}`;

    if (dL !== _strapL) { _strapL = dL; ropeL.setAttribute('d', dL); }
    if (dR !== _strapR) { _strapR = dR; ropeR.setAttribute('d', dR); }
    dring.setAttribute('transform', `translate(${cx} ${hookY})`);
  }

  function setRot(deg) {
    card.style.transform = `rotate(${Math.max(-18, Math.min(18, deg)).toFixed(1)}deg)`;
  }

  function physics() {
    if (dragging) return;
    vx += -K * x; vy += -K * y;
    vx *= DAMP; vy *= DAMP;
    x += vx; y += vy;
    setRot(x * 0.05); place(); strap();
    if (Math.abs(vx) < 0.05 && Math.abs(vy) < 0.05 && Math.abs(x) < 0.5 && Math.abs(y) < 0.5) {
      x=0; y=0; vx=0; vy=0; setRot(0); place(); strap(); rafId = null;
    } else rafId = requestAnimationFrame(physics);
  }

  function kick() { if (!rafId) rafId = requestAnimationFrame(physics); }

  // ── Flip + auto-flip back ─────────────────────
  function doFlip() {
    if (flipLocked) return;
    flipLocked = true;
    isFlipped = !isFlipped;
    flipper.classList.toggle('flipped', isFlipped);

    // Cancel previous auto-flip timer
    clearTimeout(autoFlipTimer);

    if (isFlipped) {
      // Auto-flip balik ke depan setelah 2 detik
      if (timerLabel) timerLabel.textContent = 'flipping back in 2s…';
      autoFlipTimer = setTimeout(() => {
        if (isFlipped && !flipLocked) doFlip();
      }, 2000);
    } else {
      if (timerLabel) timerLabel.textContent = 'flipping back in 2s…';
    }

    setTimeout(() => { flipLocked = false; }, 700);
  }

  function pt(e) {
    return e.touches ? {x:e.touches[0].clientX,y:e.touches[0].clientY} : {x:e.clientX,y:e.clientY};
  }

  function onDown(e) {
    if (e.button && e.button !== 0) return;
    e.preventDefault();
    dragging = true; cancelAnimationFrame(rafId); rafId = null; clearTimeout(idleTimer);
    card.style.willChange = 'left, top, transform';
    const p = pt(e), r = card.getBoundingClientRect();
    ox = p.x-r.left; oy = p.y-r.top;
    pmx = p.x; pmy = p.y; dragDX = 0; dragT = Date.now(); vx = 0; vy = 0;
    card.style.cursor = 'grabbing';
  }
  function onMove(e) {
    if (!dragging) return;
    e.preventDefault();
    const p = pt(e), sr = scene.getBoundingClientRect();
    vx = vx*0.25+(p.x-pmx)*0.75; vy = vy*0.25+(p.y-pmy)*0.75;
    dragDX += p.x-pmx; pmx = p.x; pmy = p.y;
    x = p.x - sr.left - ox - rx;
    y = p.y - sr.top  - oy - ry;
    setRot(vx*2); place(); strap();
  }
  function onUp() {
    if (!dragging) return;
    dragging = false; card.style.cursor = 'grab';
    card.style.willChange = 'auto';
    if (Math.abs(dragDX) > 55 && Math.abs(vx) > 4 && Date.now()-dragT < 500) doFlip();
    kick();
    idleTimer = setTimeout(doWiggle, 5000);
  }
  function doWiggle() {
    if (dragging || isFlipped) return;
    flipper.classList.remove('wiggling'); void flipper.offsetWidth; flipper.classList.add('wiggling');
    flipper.addEventListener('animationend', () => {
      flipper.classList.remove('wiggling');
      idleTimer = setTimeout(doWiggle, 7000);
    }, { once: true });
  }

  let lastTap = 0;
  card.addEventListener('dblclick', doFlip);
  card.addEventListener('touchend', () => {
    const n = Date.now(); if (n-lastTap < 350) doFlip(); lastTap = n; onUp();
  });
  card.addEventListener('mousedown', onDown);
  card.addEventListener('touchstart', onDown, { passive: false });

  // Pasang mousemove/touchmove hanya saat dragging aktif
  // supaya tidak firing saat user scroll di section lain
  function onDragStart() {
    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('mouseup', onUpClean);
    document.addEventListener('touchend', onUpClean);
  }
  function onUpClean() {
    onUp();
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('mouseup', onUpClean);
    document.removeEventListener('touchend', onUpClean);
  }

  card.addEventListener('mousedown', onDragStart);
  card.addEventListener('touchstart', onDragStart, { passive: false });

  measure();

  if (opts.delayed) {
    // Manual reveal mode: park card di kanan offscreen (deket), jangan kick.
    // Caller akan panggil revealCard() saat hero cascade siap.
    x = 240;
    y = -28;
    card.style.transform = 'rotate(-16deg)';
    place(); strap();
  } else {
    setTimeout(() => { measure(); vx=3; vy=-0.8; kick(); idleTimer=setTimeout(doWiggle,5000); }, 500);
  }

  window.addEventListener('resize', () => { if(!dragging){x=0;y=0;vx=0;vy=0;} measure(); });

  // Pause physics saat hero tidak di viewport : hemat RAF saat user scroll ke bawah
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

  // ── Swing in dari pojok kanan (manual reveal mode) ─────────────
  // Card start offscreen kanan + miring negatif, lalu elastic swing
  // ke posisi rest. Setelah selesai, kontrol balik ke physics.
  function revealCard() {
    measure();
    cancelAnimationFrame(rafId); rafId = null;
    clearTimeout(idleTimer);

    const gsap = window.gsap;
    if (!gsap) {
      x = 0; y = 0; vx = -6; vy = 0;
      place(); strap(); kick();
      idleTimer = setTimeout(doWiggle, 5500);
      return;
    }

    const state = { x: 240, y: -28, rot: -16 };
    x = state.x; y = state.y;
    card.style.transform = `rotate(${state.rot}deg)`;
    place(); strap();

    gsap.to(state, {
      x: 0, y: 0, rot: 0,
      duration: 1.6,
      ease: 'elastic.out(1.0, 0.45)',
      onUpdate: () => {
        x = state.x; y = state.y;
        card.style.transform = `rotate(${state.rot.toFixed(2)}deg)`;
        place(); strap();
      },
      onComplete: () => {
        x = 0; y = 0; vx = 0; vy = 0;
        setRot(0); place(); strap();
        idleTimer = setTimeout(doWiggle, 5500);
      },
    });
  }

  return revealCard;
}
