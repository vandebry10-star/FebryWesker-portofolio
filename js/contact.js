/**
 * contact.js : reveal jumbo display + channel rows
 * + toggle .is-on-dark on nav while Contact/Footer in viewport
 */

export function initContact() {
  const gsap = window.gsap;
  const ST   = window.ScrollTrigger;

  const sec = document.getElementById('contact');
  if (!sec) return;

  const lines    = sec.querySelectorAll('.fw-contact-display-line');
  const intro    = sec.querySelector('.fw-contact-intro');
  const rows     = sec.querySelectorAll('.fw-contact-row');
  const foot     = sec.querySelector('.fw-contact-foot');

  // No GSAP fallback: show everything
  if (!gsap) {
    [...lines, intro, ...rows, foot].forEach((el) => {
      if (el) { el.style.opacity = 1; el.style.transform = 'none'; }
    });
    setupNavInversion(null);
    return;
  }

  gsap.set(lines, { opacity: 0, yPercent: 60 });
  gsap.set(intro, { opacity: 0, y: 14 });
  gsap.set(rows,  { opacity: 0, y: 20 });
  if (foot) gsap.set(foot, { opacity: 0, y: 10 });

  let played = false;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || played) return;
      played = true;

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.to(lines, {
          opacity: 1, yPercent: 0,
          duration: 0.9, stagger: 0.08,
        })
        .to(intro, { opacity: 1, y: 0, duration: 0.55 }, '-=0.5')
        .to(rows, {
          opacity: 1, y: 0,
          duration: 0.55, stagger: 0.07,
        }, '-=0.4');
      if (foot) tl.to(foot, { opacity: 1, y: 0, duration: 0.5 }, '-=0.3');

      io.disconnect();
    });
  }, {
    rootMargin: '0px 0px -15% 0px',
    threshold: 0,
  });
  io.observe(sec);

  setupNavInversion(ST);
}

function setupNavInversion(ST) {
  const nav   = document.getElementById('navbar');
  const start = document.getElementById('contact');
  if (!nav || !start) return;

  const applyOn  = () => nav.classList.add('is-on-dark');
  const applyOff = () => nav.classList.remove('is-on-dark');

  if (ST) {
    ST.create({
      trigger: start,
      start: 'top top+=' + (cssVarPx('--nav-h') / 2 || 32),
      endTrigger: 'footer.fw-footer',
      end: 'bottom top+=' + (cssVarPx('--nav-h') / 2 || 32),
      onEnter:      applyOn,
      onEnterBack:  applyOn,
      onLeave:      applyOff,
      onLeaveBack:  applyOff,
    });
    return;
  }

  // IntersectionObserver fallback: watch contact + footer separately
  const footer = document.querySelector('footer.fw-footer');
  const targets = [start, footer].filter(Boolean);
  const navH = cssVarPx('--nav-h') || 64;
  const obs = new IntersectionObserver(() => {
    const fromTop = navH / 2;
    const onDark = targets.some((el) => {
      const r = el.getBoundingClientRect();
      return r.top <= fromTop && r.bottom > fromTop;
    });
    onDark ? applyOn() : applyOff();
  }, { threshold: [0, 0.01, 1] });
  targets.forEach((t) => obs.observe(t));
}

function cssVarPx(name) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : 0;
}
