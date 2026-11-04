/*
 * Fast smooth scrolling. The browser's own `behavior: 'smooth'` can take half a second or more on a long
 * page, so long jumps skip most of the way instantly and only glide the last stretch (≤ 170 ms).
 */

const GLIDE_PX = 400;
let frame = 0;
let finish: (() => void) | null = null;

function stop() {
  cancelAnimationFrame(frame);
  const f = finish;
  finish = null;
  f?.();
}

// Any user scroll input takes over immediately.
if (typeof window !== 'undefined') {
  for (const ev of ['wheel', 'touchstart', 'keydown', 'mousedown']) addEventListener(ev, () => finish && stop(), { passive: true });
}

/** Scroll the page to `top` (px). `done` runs when the scroll has finished or was interrupted. */
export function scrollToY(top: number, done?: () => void) {
  stop();
  const max = document.documentElement.scrollHeight - innerHeight;
  const target = Math.round(Math.max(0, Math.min(top, max)));
  const dist = target - scrollY;
  if (Math.abs(dist) < 2 || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    scrollTo({ top: target, behavior: 'instant' });
    done?.();
    return;
  }
  const glide = Math.min(Math.abs(dist), GLIDE_PX);
  const from = target - Math.sign(dist) * glide;
  scrollTo({ top: from, behavior: 'instant' });
  const duration = 120 + (glide / GLIDE_PX) * 50; // 120–170 ms
  const t0 = performance.now();
  finish = done ?? (() => {});
  const step = (now: number) => {
    const t = Math.min(1, (now - t0) / duration);
    const eased = 1 - (1 - t) ** 3; // ease-out cubic
    scrollTo({ top: from + (target - from) * eased, behavior: 'instant' });
    if (t < 1) frame = requestAnimationFrame(step);
    else stop();
  };
  frame = requestAnimationFrame(step);
}

/** Scroll so `el` sits just below the sticky header (uses the page's scroll-padding-top). */
export function scrollToEl(el: Element, done?: () => void) {
  const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
  scrollToY(el.getBoundingClientRect().top + scrollY - pad, done);
}
