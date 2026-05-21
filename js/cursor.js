/**
 * cursor.js : minimal lerp dot follower
 * Active only on pointer:fine + hover capable devices.
 * Hover grows on interactive elements (a, button, .fw-contact-row).
 */

export function initCursor() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const dot = document.createElement('div');
  dot.className = 'fw-cursor';
  document.body.appendChild(dot);
  document.documentElement.classList.add('has-cursor');

  let mx = window.innerWidth / 2;
  let my = window.innerHeight / 2;
  let x  = mx;
  let y  = my;
  let armed = false;

  const HOVER_SEL = 'a, button, .fw-contact-row, .fw-proj-cta, .fw-footer-top, .fw-proj-more-link, .fw-proj-dot';

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    if (!armed) {
      armed = true;
      dot.classList.add('is-active');
    }
  }, { passive: true });

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest && e.target.closest(HOVER_SEL)) {
      dot.classList.add('is-hover');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest && e.target.closest(HOVER_SEL)) {
      dot.classList.remove('is-hover');
    }
  });

  window.addEventListener('mouseleave', () => dot.classList.remove('is-active'));
  window.addEventListener('mouseenter', () => armed && dot.classList.add('is-active'));

  const LERP = 0.18;
  const tick = () => {
    x += (mx - x) * LERP;
    y += (my - y) * LERP;
    dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
