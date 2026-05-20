/**
 * loading.js v6.0
 *
 * Loader menyatu dengan hero via FLIP handoff.
 *
 * Flow:
 * 1. Loader render: nama (char-stagger) + tagline + progress line tipis
 * 2. Wait resources + MIN_TIME, snap progress ke 100%
 * 3. Fade chrome (tagline + progress + grid + glow); nama tetap solid
 * 4. onHandoff callback → caller init hero (hidden), kembalikan controller
 * 5. FLIP nama loader ke posisi+ukuran nama hero
 * 6. Crossfade: nama loader fade out, nama hero fade in (same spot)
 * 7. Trigger revealCascade + dropFromAbove di hero (paralel)
 * 8. Fade out loader bg, remove loader
 */

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── Wait images (non-lazy) + fonts ────────────
function waitForResources() {
  const fontReady = document.fonts ? document.fonts.ready : Promise.resolve();

  const imgLoad = new Promise(resolve => {
    const imgs = Array.from(document.querySelectorAll('img[src]:not([loading="lazy"])'));
    if (!imgs.length) { resolve(); return; }
    let remaining = imgs.length;
    const done = () => { if (--remaining <= 0) resolve(); };
    imgs.forEach(img => {
      if (img.complete) { done(); return; }
      img.addEventListener('load',  done, { once: true });
      img.addEventListener('error', done, { once: true });
    });
  });

  return Promise.race([
    Promise.all([fontReady, imgLoad]),
    sleep(5000),
  ]);
}

// ── Build loader HTML ─────────────────────────
export function buildLoaderHTML() {
  const loader = document.getElementById('fw-loader');
  if (!loader || loader.dataset.built) return;
  loader.dataset.built = '1';

  const name = 'Febry Wesker';
  const charSpans = name.split('').map((ch, i) => {
    const delay = (0.14 + i * 0.068).toFixed(2);
    if (ch === ' ') {
      return `<span style="display:inline-block;width:0.26em;flex-shrink:0;"></span>`;
    }
    return `<span class="fw-load-char" style="animation-delay:${delay}s">${ch}</span>`;
  }).join('');

  loader.innerHTML = `
    <div class="fw-loader-inner">
      <div class="fw-load-name" id="fw-load-name">${charSpans}</div>
      <div class="fw-load-tagline">ideas don't build themselves</div>
      <div class="fw-load-progress">
        <div class="fw-load-progress-fill" id="fw-load-prog"></div>
      </div>
    </div>
  `;
}

// ── Fake progress: scaleX dari 0 → 0.88 ──────
function startFakeProgress(fillEl) {
  let pct = 0;
  const iv = setInterval(() => {
    const step = pct < 60 ? Math.random() * 6 + 2
               : pct < 80 ? Math.random() * 3 + 0.8
               : Math.random() * 1.2 + 0.3;
    pct = Math.min(88, pct + step);
    if (fillEl) fillEl.style.transform = `scaleX(${(pct/100).toFixed(3)})`;
  }, 130);
  return () => clearInterval(iv);
}

async function snapToHundred(fillEl) {
  return new Promise(resolve => {
    if (!fillEl) { resolve(); return; }
    fillEl.style.transition = 'transform 0.38s cubic-bezier(0.4,0,0.2,1)';
    fillEl.style.transform = 'scaleX(1)';
    setTimeout(resolve, 380);
  });
}

// ── FLIP nama loader → posisi nama hero ──────
// extraOffsetY: tambahan offset Y untuk landing position (negatif = lebih naik).
// Dipakai di mobile supaya nama nyamping ke atas dikit, hero name nanti
// di-park di transform translateY(extraOffsetY) lalu slide ke 0.
async function flipNameToHero(loaderNameEl, heroNameEl, extraOffsetY = 0) {
  if (!loaderNameEl || !heroNameEl) return;

  const srcRect = loaderNameEl.getBoundingClientRect();
  const tgtRect = heroNameEl.getBoundingClientRect();

  // Pin loader name as fixed at source position
  loaderNameEl.style.position = 'fixed';
  loaderNameEl.style.left = srcRect.left + 'px';
  loaderNameEl.style.top = srcRect.top + 'px';
  loaderNameEl.style.width = srcRect.width + 'px';
  loaderNameEl.style.height = srcRect.height + 'px';
  loaderNameEl.style.margin = '0';
  loaderNameEl.style.zIndex = '10000';
  loaderNameEl.style.transformOrigin = 'top left';
  loaderNameEl.style.whiteSpace = 'nowrap';

  // Sembunyikan hero name selama FLIP
  heroNameEl.style.visibility = 'hidden';

  const dx = tgtRect.left - srcRect.left;
  const dy = (tgtRect.top - srcRect.top) + extraOffsetY;
  const scale = tgtRect.width / Math.max(1, srcRect.width);

  await new Promise(resolve => {
    if (window.gsap) {
      window.gsap.to(loaderNameEl, {
        x: dx,
        y: dy,
        scale,
        duration: 1.05,
        ease: 'power3.inOut',
        onComplete: resolve,
      });
    } else {
      loaderNameEl.style.transition = 'transform 1.05s cubic-bezier(0.65, 0, 0.35, 1)';
      loaderNameEl.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
      setTimeout(resolve, 1100);
    }
  });
}

// ── Fade hanya background loader (loader name TETAP visible) ──
// Pakai background-color transition, bukan opacity loader.
async function fadeLoaderBg(loader) {
  return new Promise(resolve => {
    loader.classList.add('is-bg-out');
    setTimeout(resolve, 620);
  });
}

/**
 * @param {Function} onHandoff
 *   Dipanggil setelah chrome fade. Caller harus init hero dalam manual
 *   reveal mode dan return controller:
 *     {
 *       heroNameEl,        ← DOM element target FLIP
 *       showHeroName(),    ← set hero name visible (dipanggil saat FLIP land)
 *       revealCascade(),   ← cascade animation hero content + drop card
 *     }
 */
export function initLoader(onHandoff) {
  return new Promise(async resolve => {
    const loader = document.getElementById('fw-loader');
    if (!loader) { resolve(); return; }

    const fillEl = document.getElementById('fw-load-prog');
    const MIN_TIME = 2400;

    const stopProgress = startFakeProgress(fillEl);

    await Promise.all([
      waitForResources(),
      sleep(MIN_TIME),
    ]);

    stopProgress();
    await snapToHundred(fillEl);
    await sleep(180);

    // Fade chrome: tagline slide-up + fade, progress collapse + fade.
    // Exit animations 0.45s & 0.55s, sleep 620 supaya keduanya komplit
    // sebelum FLIP (kalau belum opacity 0, reflow saat nama jadi fixed
    // bikin progress bar keliatan nutup nama).
    loader.classList.add('is-chrome-fade');
    await sleep(620);

    // Hand off ke caller: init hero (hidden) + return controller
    let heroCtrl = null;
    if (typeof onHandoff === 'function') {
      heroCtrl = await onHandoff();
    }

    if (!heroCtrl || !heroCtrl.heroNameEl) {
      // Fallback: instant remove
      if (loader.parentNode) loader.parentNode.removeChild(loader);
      resolve();
      return;
    }

    const loaderName = document.getElementById('fw-load-name');

    // Mobile: FLIP land 32px lebih ke atas dari posisi hero name asli,
    // lalu hero name di-park di translateY(-32px) saat swap & slide ke 0.
    // Bikin transisi mobile lebih natural (user feedback: kurang naik dikit).
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const mobileOffsetY = isMobile ? -32 : 0;

    // FLIP nama loader → posisi hero (1.05s)
    await flipNameToHero(loaderName, heroCtrl.heroNameEl, mobileOffsetY);

    // Fade hanya background loader (loader name tetap visible di z-index 10000).
    await fadeLoaderBg(loader);

    // Mobile: park hero name row di offset Y sama dengan FLIP landing,
    // sebelum showHeroName supaya user tidak lihat jump.
    let nameRow = null;
    if (mobileOffsetY) {
      nameRow = document.querySelector('.fw-name-row');
      if (nameRow) {
        nameRow.style.transition = 'none';
        nameRow.style.transform = `translateY(${mobileOffsetY}px)`;
        void nameRow.offsetHeight;
      }
    }

    // Instant swap: hero name visible, loader removed.
    if (typeof heroCtrl.showHeroName === 'function') heroCtrl.showHeroName();
    if (loader.parentNode) loader.parentNode.removeChild(loader);

    // Mobile: slide hero name row dari offset balik ke 0.
    if (nameRow) {
      requestAnimationFrame(() => {
        nameRow.style.transition = 'transform 0.85s cubic-bezier(0.34, 1.25, 0.64, 1)';
        nameRow.style.transform = 'translateY(0)';
      });
    }

    // Total 1.5s jeda dari FLIP land sebelum cascade hero.
    await sleep(880);

    // Cascade hero content + card swing
    if (typeof heroCtrl.revealCascade === 'function') heroCtrl.revealCascade();

    resolve();
  });
}
