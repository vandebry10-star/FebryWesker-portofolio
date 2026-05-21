/**
 * main.js: orchestrator
 * Init Lenis + Loader + section modules + nav.
 */

import { buildLoaderHTML, initLoader } from './loading.js';
import { initHero, revealHero }       from './hero.js';
import { initAbout }                   from './about.js';
import { initSkills }                  from './skills.js';
import { initProjects }                from './projects.js';
import { initExtras }                  from './extras.js';
import { initChapter }                 from './chapter.js';
import { initContact }                 from './contact.js';
import { initFooter }                  from './footer.js';
import { initCursor }                  from './cursor.js';

buildLoaderHTML();

document.addEventListener('DOMContentLoaded', async () => {

  initLenis();
  initHero();

  await initLoader();
  revealHero();

  initAbout();
  initSkills();
  initProjects();
  initExtras();
  initChapter();
  initContact();
  initFooter();

  initNav();
  initScrollReveal();
  initKeyboard();
  initCursor();
  logConsole();

  // Force ScrollTrigger to recalculate all trigger positions AFTER
  // every pinned section (about, projects, contact) sudah register spacer.
  // Tanpa ini, trigger yang dibuat lebih dulu pakai posisi stale dan
  // animasi section bawah bisa fire saat section atas masih pinned.
  if (window.ScrollTrigger) {
    requestAnimationFrame(() => window.ScrollTrigger.refresh());
  }
});

// ── LENIS SMOOTH SCROLL ──────────────────────
let lenisInstance = null;

function initLenis() {
  if (typeof Lenis === 'undefined' || typeof gsap === 'undefined') return;

  lenisInstance = new Lenis({
    duration: 1.5,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.6,
  });

  // ScrollTrigger integration: tick Lenis via gsap.ticker,
  // dan trigger ScrollTrigger.update pada setiap scroll event
  if (window.ScrollTrigger) {
    lenisInstance.on('scroll', () => window.ScrollTrigger.update());
    gsap.ticker.add((time) => lenisInstance.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    function raf(time) {
      lenisInstance.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // Expose ke modul lain (anchor scroll, back-to-top)
  window.__lenis = lenisInstance;
}

function smoothScrollTo(target, offset = -60) {
  if (window.__lenis) {
    window.__lenis.scrollTo(target, { offset, duration: 1.2 });
  } else {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (el) window.scrollTo({ top: el.offsetTop + offset, behavior: 'smooth' });
  }
}

// ── NAV : logo + menu button + fullscreen overlay ──
function initNav() {
  const trigger = document.getElementById('nav-menu-btn');
  const overlay = document.getElementById('nav-overlay');
  if (!trigger || !overlay) return;

  const close = () => {
    overlay.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.querySelector('.fw-nav-menu-label').textContent = 'Menu';
  };
  const open = () => {
    overlay.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
    trigger.querySelector('.fw-nav-menu-label').textContent = 'Close';
  };

  trigger.addEventListener('click', () => {
    overlay.classList.contains('is-open') ? close() : open();
  });

  // Smooth scroll dari link overlay + auto close
  overlay.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      close();
      smoothScrollTo(target, 0);
    });
  });

  // Esc to close
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) close();
  });
}

// ── SCROLL REVEAL ────────────────────────────
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ── KEYBOARD SHORTCUTS ───────────────────────
function initKeyboard() {
  const map = { '1':'home', '2':'about', '3':'skills', '4':'projects', '5':'contact' };

  document.addEventListener('keydown', e => {
    if (map[e.key] && !e.ctrlKey && !e.altKey && !e.metaKey
        && document.activeElement.tagName !== 'INPUT') {
      e.preventDefault();
      const target = document.getElementById(map[e.key]);
      if (target) smoothScrollTo(target, 0);
    }
  });
}

// ── CONSOLE EGG ──────────────────────────────
function logConsole() {
  console.log('%cFebry Wesker', 'color:#111;font-size:20px;font-weight:bold;letter-spacing:0.1em;');
  console.log('%cGitHub: github.com/vandebry10-star', 'color:#666;font-size:12px;');
  console.log('%c⚠ Do not paste unknown code here.', 'color:#a33;font-size:12px;font-weight:bold;');
}
