/**
 * loading.js : minimal counter + curtain loader
 *
 * Flow:
 *   1. buildLoaderHTML() injects DOM (called eagerly before DOMContentLoaded)
 *   2. initLoader() animates counter 000 → 100 while waiting for resources,
 *      then slides curtain up to reveal page. Resolves when loader removed.
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
    sleep(4500),
  ]);
}

export function buildLoaderHTML() {
  const loader = document.getElementById('fw-loader');
  if (!loader || loader.dataset.built) return;
  loader.dataset.built = '1';

  loader.innerHTML = `
    <div class="fw-loader-grid">
      <div class="fw-loader-tl">
        <span class="fw-loader-mark">FW</span>
        <span class="fw-loader-line"></span>
        <span class="fw-loader-meta">Febry Wesker · Portfolio 2026</span>
      </div>
      <div class="fw-loader-tr">[Loading]</div>
      <div class="fw-loader-counter">
        <span class="fw-loader-num" id="fw-loader-num">000</span>
        <span class="fw-loader-pct">%</span>
      </div>
      <div class="fw-loader-bl">ideas don&rsquo;t build themselves</div>
      <div class="fw-loader-br">Indonesia · ID</div>
    </div>
    <div class="fw-loader-curtain" aria-hidden="true"></div>
  `;
}

function animateCounter(el, durationMs) {
  return new Promise(resolve => {
    if (!el) { resolve(); return; }
    const start = performance.now();
    const fmt = n => String(Math.floor(n)).padStart(3, '0');
    const ease = t => 1 - Math.pow(1 - t, 3);
    const step = (now) => {
      const t = Math.min(1, (now - start) / durationMs);
      el.textContent = fmt(ease(t) * 100);
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
    const MIN_TIME = 1600;

    await Promise.all([
      waitForResources(),
      animateCounter(numEl, MIN_TIME),
    ]);

    await sleep(140);

    loader.classList.add('is-exit');
    await sleep(900);

    if (loader.parentNode) loader.parentNode.removeChild(loader);
    resolve();
  });
}
