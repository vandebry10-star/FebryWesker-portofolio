/**
 * skills.js: Tier-based skills section
 * IntersectionObserver entrance only · No GSAP dependency
 */

export function initSkills() {
  const targets = document.querySelectorAll(
    '#skills .fw-skill-featured, #skills .fw-skill-core, #skills .fw-skill-chip'
  );
  if (!targets.length) return;

  // Stagger group by tier: featured first, then core, then chips
  const groups = {
    'fw-skill-featured': 0,
    'fw-skill-core': 1,
    'fw-skill-chip': 2,
  };

  // Per-group local stagger counter
  const counters = [0, 0, 0];

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      io.unobserve(el);

      const groupClass = el.classList.contains('fw-skill-featured')
        ? 'fw-skill-featured'
        : el.classList.contains('fw-skill-core')
        ? 'fw-skill-core'
        : 'fw-skill-chip';
      const groupIdx = groups[groupClass];
      const localIdx = counters[groupIdx]++;

      // Base delay per group + per-item stagger
      const base = groupIdx * 120;
      const stride = groupClass === 'fw-skill-chip' ? 50 : 80;
      const delay = base + localIdx * stride;

      setTimeout(() => el.classList.add('is-visible'), delay);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  targets.forEach((el) => io.observe(el));

  initDecoParallax();
}

// Parallax drift untuk "02" decorative number
function initDecoParallax() {
  const gsap = window.gsap;
  const ST   = window.ScrollTrigger;
  const sec  = document.getElementById('skills');
  const deco = sec?.querySelector('.fw-skills-deco-num');
  if (!gsap || !ST || !sec || !deco) return;

  gsap.registerPlugin(ST);
  const isMobile = window.innerWidth <= 900;
  gsap.to(deco, {
    y: isMobile ? -60 : -120,
    x: isMobile ? -20 : -40,
    ease: 'none',
    scrollTrigger: {
      trigger: sec,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1,
    },
  });
}
