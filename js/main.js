/**
 * main.js: FebryWesker Portfolio
 * Orchestrator: imports section modules + handles global logic
 *
 * v4.0 change:
 * - initLoader() sekarang terima callback onPreHide
 *   Hero di-init 2 detik sebelum loader hilang supaya card
 *   sudah swinging saat venetian-blinds exit selesai
 */

import { buildLoaderHTML, initLoader } from './loading.js';
import { initBackground }              from './background.js';
import { initHero }                    from './hero.js';
import { initAbout }                   from './about.js';
import { initSkills }                  from './skills.js';
import { initProjects }                from './projects.js';
import { initContact }                 from './contact.js';
import { initScrollUI }                from './scroll-ui.js';

// ── 1. Loader & background jalan duluan, sebelum DOMContentLoaded ──
buildLoaderHTML();
initBackground();

// ── 2. DOMContentLoaded: init loader, lalu section-section ──
document.addEventListener('DOMContentLoaded', async () => {

  // Lenis smooth scroll: init sebelum section apapun supaya
  // ScrollTrigger integration ke-hook sebelum pinned trigger di-create
  initLenis();

  await initLoader(() => {
    // Loader handoff: init hero dalam manual reveal mode.
    // Controller dipakai loader untuk FLIP nama + trigger cascade.
    return initHero({ manualReveal: true });
  });

  // Setelah loader singkir, init section lain
  initAbout();
  initSkills();
  initProjects();
  initContact();

  // Global scroll affordances (hint, progress, indicator, blobs, bg tint)
  initScrollUI();

  // Global utilities
  initNavScroll();
  initNavLinks();
  initMobileMenu();
  initBackToTop();
  initScrollReveal();
  initKeyboard();
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
    duration: 1.1,
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

// ── NAVBAR SCROLL HIDE/SHOW ──────────────────
function initNavScroll() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  let last = 0;

  window.addEventListener('scroll', throttle(() => {
    const cur = window.scrollY;
    if (cur <= 60)       nav.style.transform = 'translateY(0)';
    else if (cur > last) nav.style.transform = 'translateY(-100%)';
    else                 nav.style.transform = 'translateY(0)';
    last = cur;
  }, 80));
}

// ── ACTIVE NAV LINK ─────────────────────────
function initNavLinks() {
  const sections = ['home', 'about', 'skills', 'projects', 'contact'];
  const links    = document.querySelectorAll('.fw-nav-link');

  window.addEventListener('scroll', throttle(() => {
    let current = 'home';
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el && window.scrollY >= el.offsetTop - 100) current = id;
    });
    links.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === '#' + current);
    });
  }, 100));

  // Smooth scroll + close mobile menu
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const menu = document.getElementById('mobile-menu');
      if (menu) {
        menu.classList.remove('open');
        const icon = document.querySelector('#nav-toggle i');
        if (icon) icon.className = 'fas fa-bars';
      }
      smoothScrollTo(target, -60);
    });
  });
}

// ── MOBILE MENU ─────────────────────────────
function initMobileMenu() {
  const btn  = document.getElementById('nav-toggle');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    const icon = btn.querySelector('i');
    if (icon) icon.className = open ? 'fas fa-times' : 'fas fa-bars';
  });

  document.addEventListener('click', e => {
    if (!menu.contains(e.target) && !btn.contains(e.target)) {
      menu.classList.remove('open');
      const icon = btn.querySelector('i');
      if (icon) icon.className = 'fas fa-bars';
    }
  });
}

// ── BACK TO TOP ─────────────────────────────
function initBackToTop() {
  const btn = document.getElementById('back-top');
  if (!btn) return;

  window.addEventListener('scroll', throttle(() => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, 100));

  btn.addEventListener('click', () => {
    if (window.__lenis) window.__lenis.scrollTo(0, { duration: 1.2 });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
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
      if (target) smoothScrollTo(target, -60);
    }
    if (e.key === 'Escape') {
      const menu = document.getElementById('mobile-menu');
      if (menu) {
        menu.classList.remove('open');
        const icon = document.querySelector('#nav-toggle i');
        if (icon) icon.className = 'fas fa-bars';
      }
    }
  });
}

// ── UTILITIES ────────────────────────────────
function throttle(fn, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// ── CONSOLE EGG ──────────────────────────────
function logConsole() {
  console.log('%cFebryWesker Portfolio', 'color:#a78bfa;font-size:20px;font-weight:bold;');
  console.log('%cGlassmorphism Edition v2.0',  'color:#93c5fd;font-size:14px;');
  console.log('%cGitHub: github.com/vandebry10-star', 'color:#f9a8d4;font-size:12px;');
  console.log('%c⚠ Do not paste unknown code here!', 'color:#f87171;font-size:12px;font-weight:bold;');
}
