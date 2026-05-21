/**
 * chapter.js: burnt-sienna interstitial
 * 1. Reveal "Let's talk." words via ScrollTrigger scrub.
 * 2. Infinite marquee loop (GSAP, scroll-aware speed boost).
 */

export function initChapter() {
  const section = document.getElementById('chapter-break');
  if (!section || typeof gsap === 'undefined') return;

  const ST = window.ScrollTrigger;
  const words = section.querySelectorAll('.fw-chapter-word-inner');
  const track = section.querySelector('#chapter-marquee');

  if (words.length) {
    gsap.set(words, { yPercent: 110 });
    if (ST) {
      gsap.to(words, {
        yPercent: 0,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: {
          trigger: section,
          start: 'top 78%',
          end: 'top 30%',
          scrub: 0.6,
        },
      });
    } else {
      gsap.to(words, { yPercent: 0, ease: 'power3.out', stagger: 0.1, duration: 1 });
    }
  }

  if (track) initMarquee(track, section);
}

function initMarquee(track, section) {
  const original = Array.from(track.children).map((el) => el.cloneNode(true));
  // Duplicate enough times to cover at least 2x viewport width for seamless loop
  let attempts = 0;
  while (track.scrollWidth < window.innerWidth * 2 && attempts < 6) {
    original.forEach((node) => track.appendChild(node.cloneNode(true)));
    attempts++;
  }

  // Track-width based loop. Animate transform on track.
  const measure = () => {
    // half = width of one set of original children (assume balanced clones)
    // since we appended copies of original group, half = scrollWidth / (1 + clonesAdded)
    // Easier: measure first N original items width including gap.
    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
    let half = 0;
    const originalCount = original.length;
    for (let i = 0; i < originalCount; i++) {
      const child = track.children[i];
      if (!child) break;
      half += child.getBoundingClientRect().width + gap;
    }
    return half;
  };

  let halfWidth = measure();
  const baseDuration = Math.max(18, halfWidth / 60); // px per second feel

  const tween = gsap.to(track, {
    x: -halfWidth,
    duration: baseDuration,
    ease: 'none',
    repeat: -1,
    modifiers: {
      x: gsap.utils.unitize((x) => parseFloat(x) % -halfWidth),
    },
  });

  // Speed boost while chapter section is in view
  const ST = window.ScrollTrigger;
  if (ST) {
    ST.create({
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      onEnter: () => gsap.to(tween, { timeScale: 1.4, duration: 0.6 }),
      onEnterBack: () => gsap.to(tween, { timeScale: 1.4, duration: 0.6 }),
      onLeave: () => gsap.to(tween, { timeScale: 1, duration: 0.6 }),
      onLeaveBack: () => gsap.to(tween, { timeScale: 1, duration: 0.6 }),
    });
  }

  // Recalculate on resize
  let resizeRaf = null;
  window.addEventListener('resize', () => {
    if (resizeRaf) cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      const newHalf = measure();
      if (Math.abs(newHalf - halfWidth) > 4) {
        halfWidth = newHalf;
        tween.vars.x = -halfWidth;
        tween.duration(Math.max(18, halfWidth / 60));
        tween.invalidate().restart();
      }
    });
  });
}
