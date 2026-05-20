/**
 * projects.js v7: Stacked thumbnail cards
 *
 * Pelajaran v6: src swap di satu <img> bikin lag karena walaupun cached,
 * browser tetap re-decode tiap kali. Plus animasi gsap overlap pas
 * scroll cepet.
 *
 * v7: render N <img> elements stacked di DOM dari awal. Semua udah
 * loaded + decoded di-browser. Switch = cuma toggle opacity, gak ada
 * load delay sama sekali, gak ada re-decode. Card-style.
 */

export function initProjects() {
  if (!window.gsap || !window.ScrollTrigger) {
    setTimeout(initProjects, 100);
    return;
  }

  const section = document.getElementById('projects');
  if (!section) return;

  const dataEl = document.getElementById('proj-data');
  if (!dataEl) return;

  let projects;
  try {
    projects = JSON.parse(dataEl.textContent);
  } catch (e) {
    console.error('[projects.js] Invalid JSON:', e);
    return;
  }
  if (!projects.length) return;

  // Preload paralel semua thumb. Karena semua bakal di-render stacked di DOM,
  // browser akan otomatis decode + cache. Cuma tunggu yang pertama doang
  // supaya hero render gak nunggu kelar semua.
  preload(projects.map((p) => p.thumb).filter(Boolean))
    .then(() => render(section, projects));
}

function preload(urls) {
  return Promise.race([
    Promise.all(urls.map((src) => new Promise((res) => {
      const img = new Image();
      img.onload = img.onerror = res;
      img.src = src;
    }))),
    new Promise((r) => setTimeout(r, 1500)),
  ]);
}

function render(section, projects) {
  const gsap = window.gsap;
  const ST   = window.ScrollTrigger;
  gsap.registerPlugin(ST);

  const total = projects.length;
  const totalStr = String(total).padStart(2, '0');
  const now = new Date().getFullYear();

  section.insertAdjacentHTML('beforeend', `
    <div class="fw-proj-sticky">

      <div class="fw-proj-grid-bg"></div>
      <div class="fw-proj-deco-num">03</div>
      <div class="fw-proj-anchor"></div>
      <div class="fw-proj-scanline"></div>

      <div class="fw-proj-meta">
        <div class="fw-proj-meta-left">
          <span class="fw-proj-status"><span class="fw-proj-status-dot"></span> Live Reel</span>
          <span class="fw-proj-meta-dot"></span>
          <span>Selected Work</span>
          <span class="fw-proj-meta-dot"></span>
          <span>${now}</span>
        </div>
        <div class="fw-proj-meta-right">
          <span id="proj-count">01</span>
          <span class="fw-proj-meta-dot"></span>
          <span>${totalStr}</span>
        </div>
      </div>

      <div class="fw-proj-body">
        <div class="fw-proj-left">
          <div class="fw-proj-num-wrap">
            <div class="fw-proj-num" id="proj-num">01</div>
          </div>
          <h3 class="fw-proj-title" id="proj-title"></h3>
          <p class="fw-proj-desc" id="proj-desc"></p>
          <div class="fw-proj-tags" id="proj-tags"></div>
          <a class="fw-proj-cta" id="proj-cta" href="#" target="_blank" rel="noopener"></a>
        </div>

        <div class="fw-proj-right">
          <div class="fw-proj-frame">
            <span class="fw-proj-frame-corner tl"></span>
            <span class="fw-proj-frame-corner tr"></span>
            <span class="fw-proj-frame-corner bl"></span>
            <span class="fw-proj-frame-corner br"></span>
            <span class="fw-proj-frame-coord tl">N 36.18 / E 122.74</span>
            <span class="fw-proj-frame-coord br">CASE / ${totalStr}</span>

            <div class="fw-proj-thumb" id="proj-thumb">
              <span class="fw-proj-offline-badge">Offline</span>
              ${projects.map((p, i) => `
                <img class="fw-proj-thumb-img${p.thumbFit === 'contain' ? ' is-fit-contain' : ''}${i === 0 ? ' is-active' : ''}"
                     data-i="${i}"
                     src="${p.thumb}"
                     alt="${escapeHtml(p.title)}">
              `).join('')}
              <div class="fw-proj-thumb-fade"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="fw-proj-dots" id="proj-dots">
        ${projects.map((_, i) => `<div class="fw-proj-dot ${i === 0 ? 'is-active' : ''}" data-i="${i}"></div>`).join('')}
      </div>

      <div class="fw-proj-hint">scroll to explore ↓</div>
    </div>
  `);

  // Minimal CTA di luar section: cuma satu link ke GitHub
  const moreHTML = `
    <div class="fw-proj-more">
      <a href="https://github.com/vandebry10-star" target="_blank" rel="noopener"
         class="fw-proj-more-link">
        <span class="fw-proj-more-link-bracket">[</span>
        <i class="fab fa-github"></i>
        <span class="fw-proj-more-link-text">View more on GitHub</span>
        <i class="fas fa-arrow-right fw-proj-more-link-arrow"></i>
        <span class="fw-proj-more-link-bracket">]</span>
      </a>
    </div>
  `;
  section.insertAdjacentHTML('afterend', moreHTML);

  const sticky = section.querySelector('.fw-proj-sticky');

  const refs = {
    count:     document.getElementById('proj-count'),
    num:       document.getElementById('proj-num'),
    title:     document.getElementById('proj-title'),
    desc:      document.getElementById('proj-desc'),
    tags:      document.getElementById('proj-tags'),
    cta:       document.getElementById('proj-cta'),
    thumb:     document.getElementById('proj-thumb'),
    thumbImgs: Array.from(document.querySelectorAll('#proj-thumb .fw-proj-thumb-img')),
    dots:      Array.from(document.querySelectorAll('.fw-proj-dots .fw-proj-dot')),
  };

  paint(projects[0], refs);

  // GSAP pin: stay pinned selama (N-1) * 100vh scroll.
  // onUpdate hitung index dari progress (0..1) lalu trigger switch.
  let current = 0;
  ST.create({
    trigger: section,
    start: 'top top',
    end: () => `+=${(total - 1) * window.innerHeight}`,
    pin: sticky,
    pinSpacing: true,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      // progress = 0 di project 0, progress = 1 di project N-1
      const raw = self.progress * (total - 1);
      const idx = Math.min(total - 1, Math.max(0, Math.round(raw)));
      if (idx !== current) {
        const prev = current;
        current = idx;
        switchTo(projects[idx], idx, prev, refs);
      }
    },
  });

  // Refresh setelah render selesai supaya posisi pin akurat.
  // Penting karena render() dipanggil async setelah preload.
  ST.refresh();
}

function paint(p, refs) {
  refs.num.textContent     = '01';
  refs.count.textContent   = '01';
  refs.title.innerHTML     = wrapWords(p.title);
  refs.desc.textContent    = p.desc;
  refs.tags.innerHTML      = p.tags.map((t) => `<span class="fw-proj-tag">${t}</span>`).join('');
  refs.cta.innerHTML       = `<i class="${p.cta.icon}"></i> ${p.cta.label}`;
  refs.cta.href            = p.url;
  refs.thumb.classList.toggle('is-offline', !!p.offline);
  refs.cta.classList.toggle('fw-proj-cta--disabled', !!p.offline);
}

function switchTo(p, idx, prev, refs) {
  const numStr = String(idx + 1).padStart(2, '0');
  const fwd    = idx > prev;

  gsap.to(refs.num, {
    yPercent: fwd ? -100 : 100,
    opacity: 0,
    duration: 0.25,
    ease: 'power3.in',
    overwrite: true,
    onComplete: () => {
      refs.num.textContent = numStr;
      refs.count.textContent = numStr;
      gsap.fromTo(refs.num,
        { yPercent: fwd ? 100 : -100, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.4, ease: 'power3.out', overwrite: true }
      );
    },
  });

  const oldWords = refs.title.querySelectorAll('.fw-proj-word-inner');
  gsap.to(oldWords, {
    yPercent: -110,
    duration: 0.25,
    stagger: 0.02,
    ease: 'power3.in',
    overwrite: true,
    onComplete: () => {
      refs.title.innerHTML = wrapWords(p.title);
      const newWords = refs.title.querySelectorAll('.fw-proj-word-inner');
      gsap.fromTo(newWords,
        { yPercent: 110 },
        { yPercent: 0, duration: 0.5, stagger: 0.035, ease: 'power3.out', overwrite: true }
      );
    },
  });

  gsap.to([refs.desc, refs.tags, refs.cta], {
    opacity: 0,
    y: fwd ? -10 : 10,
    duration: 0.2,
    ease: 'power2.in',
    overwrite: true,
    onComplete: () => {
      refs.desc.textContent = p.desc;
      refs.tags.innerHTML   = p.tags.map((t) => `<span class="fw-proj-tag">${t}</span>`).join('');
      refs.cta.innerHTML    = `<i class="${p.cta.icon}"></i> ${p.cta.label}`;
      refs.cta.href         = p.url;
      refs.cta.classList.toggle('fw-proj-cta--disabled', !!p.offline);
      gsap.fromTo([refs.desc, refs.tags, refs.cta],
        { opacity: 0, y: fwd ? 10 : -10 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.04, ease: 'power3.out', overwrite: true }
      );
    },
  });

  // Stacked card switch: toggle .is-active class, CSS handle opacity transisi.
  // Semua img udah loaded di DOM, gak ada delay sama sekali.
  refs.thumbImgs.forEach((img, i) => {
    img.classList.toggle('is-active', i === idx);
  });
  refs.thumb.classList.toggle('is-offline', !!p.offline);

  refs.dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
}

function wrapWords(text) {
  return text
    .split(/\s+/)
    .map((w) => `<span class="fw-proj-word"><span class="fw-proj-word-inner">${escapeHtml(w)}</span></span>`)
    .join(' ');
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}
