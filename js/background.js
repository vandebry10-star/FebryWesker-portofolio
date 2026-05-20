/**
 * background.js — Static, inject noise layer saja
 */
export function initBackground() {
  // Inject noise div (dibutuhkan CSS background.css layer 3)
  if (!document.querySelector('.fw-bg-noise')) {
    const noise = document.createElement('div');
    noise.className = 'fw-bg-noise';
    document.body.insertBefore(noise, document.body.firstChild);
  }
}
