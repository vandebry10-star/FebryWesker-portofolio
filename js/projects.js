/**
 * projects.js : per-project pin + 65/35 split
 *
 * Architecture (kept from v7):
 *   - Preload all thumbs, render N <img> stacked, toggle .is-active opacity
 *     so switching projects costs nothing (no re-decode, no load).
 *   - One ScrollTrigger pin with budget = (N-1) * 100vh.
 *   - onUpdate maps progress 0..1 → integer index → switchTo().
 *
 * Visual (Phase 6):
 *   - Cream editorial, no scanlines / deco-num / glow.
 *   - Left 65 %: huge muted number, per-word title reveal, copy, CTA.
 *   - Right 35 %: static thumbnail, no zoom motion.
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

  // Render markup synchronously so projects pinSpacer exists by the time
  // main.js calls ScrollTrigger.refresh(). Preload runs in the background
  // just to warm the browser image cache.
  render(section, projects);
  preload(projects.map((p) => p.thumb).filter(Boolean));
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

  section.insertAdjacentHTML('beforeend', `
    <div class="fw-proj-sticky">

      <span class="fw-proj-ghost" id="proj-ghost" aria-hidden="true">selected</span>

      <div class="fw-proj-meta">
        <div class="fw-proj-meta-left">
          <span class="fw-proj-meta-num">(03)</span>
          <span class="fw-proj-meta-label">Selected Work</span>
        </div>
        <div class="fw-proj-meta-right">
          <span id="proj-count">01</span>
          <span class="fw-proj-meta-sep">/</span>
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
          <div class="fw-proj-thumb" id="proj-thumb">
            <span class="fw-proj-offline-badge">Offline</span>
            ${projects.map((p, i) => `
              <img class="fw-proj-thumb-img${p.thumbFit === 'contain' ? ' is-fit-contain' : ''}${i === 0 ? ' is-active' : ''}"
                   data-i="${i}"
                   src="${p.thumb}"
                   alt="${escapeHtml(p.title)}">
            `).join('')}
          </div>
        </div>
      </div>

      <div class="fw-proj-dots" id="proj-dots">
        ${projects.map((_, i) => `<div class="fw-proj-dot ${i === 0 ? 'is-active' : ''}" data-i="${i}"></div>`).join('')}
      </div>

    </div>
  `);

  section.insertAdjacentHTML('afterend', `
    <div class="fw-proj-more">
      <a href="https://github.com/vandebry10-star" target="_blank" rel="noopener" class="fw-proj-more-link">
        <span>View more on GitHub</span>
        <span class="fw-proj-more-arrow">&rarr;</span>
      </a>
    </div>
  `);

  const sticky = section.querySelector('.fw-proj-sticky');
  const ghost  = section.querySelector('#proj-ghost');

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

  let current = 0;

  if (ghost) ghost.style.transform = 'translate3d(15%, 0, 0)';

  ST.create({
    trigger: section,
    start: 'top top',
    end: () => `+=${(total - 1) * window.innerHeight}`,
    pin: sticky,
    pinSpacing: true,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      const raw = self.progress * (total - 1);
      const idx = Math.min(total - 1, Math.max(0, Math.round(raw)));
      if (idx !== current) {
        const prev = current;
        current = idx;
        switchTo(projects[idx], idx, prev, refs);
      }
      if (ghost) {
        // 15% → -32% across the full pin (4 transitions for 5 projects)
        const xp = 15 + self.progress * -47;
        ghost.style.transform = `translate3d(${xp}%, 0, 0)`;
      }
    },
  });

  ST.refresh();
}

function paint(p, refs) {
  refs.num.textContent     = '01';
  refs.count.textContent   = '01';
  refs.title.innerHTML     = wrapWords(p.title);
  refs.desc.textContent    = p.desc;
  refs.tags.innerHTML      = p.tags.map((t) => `<span class="fw-proj-tag">${t}</span>`).join('');
  refs.cta.innerHTML       = `<span>${escapeHtml(p.cta.label)}</span><span class="fw-proj-cta-arrow">&rarr;</span>`;
  refs.cta.href            = p.url;
  refs.thumb.classList.toggle('is-offline', !!p.offline);
  refs.cta.classList.toggle('fw-proj-cta--disabled', !!p.offline);
}

function switchTo(p, idx, prev, refs) {
  const gsap = window.gsap;
  const numStr = String(idx + 1).padStart(2, '0');
  const fwd    = idx > prev;

  gsap.to(refs.num, {
    yPercent: fwd ? -100 : 100,
    opacity: 0,
    duration: 0.25,
    ease: 'power3.in',
    overwrite: true,
    onComplete: () => {
      refs.num.textContent   = numStr;
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
      refs.cta.innerHTML    = `<span>${escapeHtml(p.cta.label)}</span><span class="fw-proj-cta-arrow">&rarr;</span>`;
      refs.cta.href         = p.url;
      refs.cta.classList.toggle('fw-proj-cta--disabled', !!p.offline);
      gsap.fromTo([refs.desc, refs.tags, refs.cta],
        { opacity: 0, y: fwd ? 10 : -10 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.04, ease: 'power3.out', overwrite: true }
      );
    },
  });

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
