/* =========================
   Azbry Portfolio Script
   - Typing effect
   - AOS init
   - Tilt init
   - Smooth scroll + shortcut
   ========================= */

// Typing effect
const typingPhrases = [
  "Web Game Developer",
  "WhatsApp Bot (Azbry-MD)",
  "UI/UX Neon Dark",
  "JavaScript & Canvas",
  "Vercel • GitHub • REST API"
];

(function typewriter(){
  const el = document.getElementById('typing');
  if(!el) return;
  let i = 0, j = 0, deleting = false;

  function tick(){
    const word = typingPhrases[i];
    el.textContent = deleting ? word.slice(0, j--) : word.slice(0, j++);
    const base = deleting ? 38 : 54;
    const delay = j === word.length ? 1000 : j === 0 ? 400 : base + Math.random()*60;

    if (!deleting && j === word.length) deleting = true;
    else if (deleting && j < 0) { deleting = false; i = (i+1) % typingPhrases.length; j = 0; }

    setTimeout(tick, delay);
  }
  tick();
})();

// AOS
AOS.init({
  duration: 700,
  offset: 80,
  once: true,
  easing: 'ease-out'
});

// VanillaTilt (elemen dengan [data-tilt])
document.querySelectorAll('[data-tilt]').forEach(el=>{
  // VanillaTilt sudah auto-initialize via atribut; ini fallback
  try { window.VanillaTilt && window.VanillaTilt.init(el, { max:8, speed:400, glare:false }); } catch {}
});

// Smooth scroll untuk link navbar
document.querySelectorAll('nav a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    e.preventDefault();
    const id = a.getAttribute('href');
    const el = document.querySelector(id);
    el && el.scrollIntoView({ behavior:'smooth', block:'start' });
  });
});

// Shortcut: G => ke Projects
window.addEventListener('keydown', e=>{
  if (e.key.toLowerCase() === 'g') {
    const el = document.getElementById('projects');
    el && el.scrollIntoView({ behavior:'smooth' });
  }
});

// Tahun footer
document.getElementById('year') && (document.getElementById('year').textContent = new Date().getFullYear());
