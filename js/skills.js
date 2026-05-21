/**
 * skills.js : pinned horizontal scroll plates
 *
 * Vertical scroll budget translates the track horizontally.
 * Progress drives the "NN / 05" indicator.
 */

export function initSkills() {
  const gsap = window.gsap;
  const ST   = window.ScrollTrigger;

  const sec   = document.getElementById('skills');
  const pin   = sec?.querySelector('.fw-skills-pin');
  const track = sec?.querySelector('#skills-track');
  const wrap  = sec?.querySelector('.fw-skills-track-wrap');
  const progressEl = sec?.querySelector('#skills-progress');
  if (!sec || !pin || !track || !wrap) return;

  const plates = track.querySelectorAll('.fw-plate');
  if (!plates.length) return;
  const total = plates.length;
  const fmt = (n) => String(n).padStart(2, '0');

  if (progressEl) progressEl.textContent = `01 / ${fmt(total)}`;

  // Fallback: no GSAP → native horizontal scroll
  if (!gsap || !ST) {
    wrap.style.overflowX = 'auto';
    return;
  }

  gsap.registerPlugin(ST);

  const computeDistance = () => {
    return Math.max(0, track.scrollWidth - wrap.clientWidth);
  };

  gsap.to(track, {
    x: () => -computeDistance(),
    ease: 'none',
    scrollTrigger: {
      trigger: sec,
      start: 'top top',
      end: () => `+=${computeDistance() + window.innerHeight * 0.3}`,
      pin: pin,
      scrub: 0.6,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        if (!progressEl) return;
        const i = Math.min(total, Math.max(1, Math.floor(self.progress * total) + 1));
        progressEl.textContent = `${fmt(i)} / ${fmt(total)}`;
      },
    },
  });
}
