/**
 * loading.js : editorial loader inspired by aim.obys.agency
 *
 * Layout: brand top-left, status top-right, masked display center,
 * tagline + 1px progress bar bottom-left, counter (00 / 100) bottom-right.
 * Exit: split curtain via clip-path inset 0 -> inset 50% on the wrapper.
 */

const sleep = ms => new Promise(r => setTimeout(r, ms));

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

export function buildLoaderHTML() {
  const loader = document.getElementById('fw-loader');
  if (!loader || loader.dataset.built) return;
  loader.dataset.built = '1';

  loader.innerHTML = `
    <div class="fw-loader-shell">

      <div class="fw-loader-top">
        <div class="fw-loader-brand">
          <span class="fw-loader-mark">FW</span>
          <span class="fw-loader-brand-text">Febry Wesker &middot; Portfolio</span>
        </div>
        <div class="fw-loader-status">
          <span class="fw-loader-status-dot" aria-hidden="true"></span>
          <span>Loading</span>
        </div>
      </div>

      <div class="fw-loader-display" aria-hidden="true">
        <div class="fw-loader-line"><span class="fw-loader-line-inner">Febry</span></div>
        <div class="fw-loader-line"><span class="fw-loader-line-inner"><em>Wesker</em></span></div>
      </div>

      <div class="fw-loader-bottom">
        <div class="fw-loader-bottom-l">
          <span class="fw-loader-tag">An editorial portfolio &middot; 2026</span>
          <div class="fw-loader-progress" aria-hidden="true">
            <div class="fw-loader-progress-bar" id="fw-loader-bar"></div>
          </div>
        </div>
        <div class="fw-loader-counter">
          <span class="fw-loader-num" id="fw-loader-num">00</span>
          <span class="fw-loader-num-sep">/</span>
          <span class="fw-loader-num-total">100</span>
        </div>
      </div>

    </div>
  `;
}

// Counter 0 -> 100 with cubic ease-out, syncs progress bar width along the way.
function animateCounter(numEl, barEl, durationMs) {
  return new Promise(resolve => {
    if (!numEl) { resolve(); return; }
    const start = performance.now();
    const fmt = n => String(Math.floor(n)).padStart(2, '0');
    const ease = t => 1 - Math.pow(1 - t, 3);
    const step = (now) => {
      const t = Math.min(1, (now - start) / durationMs);
      const value = ease(t) * 100;
      numEl.textContent = fmt(value);
      if (barEl) barEl.style.width = value.toFixed(2) + '%';
      if (t < 1) requestAnimationFrame(step);
      else resolve();
    };
    requestAnimationFrame(step);
  });
}

export function initLoader() {
  return new Promise(async resolve => {
    const loader = document.getElementById('fw-loader');
    if (!loader) { resolve(); return; }

    const numEl = document.getElementById('fw-loader-num');
    const barEl = document.getElementById('fw-loader-bar');
    const MIN_TIME = 2200;

    await Promise.all([
      waitForResources(),
      animateCounter(numEl, barEl, MIN_TIME),
    ]);

    // hold at 100% briefly before splitting open
    await sleep(260);

    loader.classList.add('is-exit');
    await sleep(950);

    if (loader.parentNode) loader.parentNode.removeChild(loader);
    resolve();
  });
}
