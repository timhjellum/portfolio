/* ============================================================
   PARALLAX ENGINE (ported from the Disney CodePen, unchanged)
   Framework-free scroll choreography. Describe a section with a
   plain config object and call parallaxSection(config); no
   per-section wiring code needed.

   Every section runs the same pipeline (each step optional):
     1. trigger  - the section scrolls into view
     2. reveal   - add .in-view to layers (CSS plays the entrance)
     3. landed   - the entrance animation finishes
     4. pop      - pop layers in, then settle into a hover float
     5. complete - the section's choreography is done
   plus an optional scroll-scrubbed layer that moves with scroll.

   Each step dispatches a bubbling event on the section root:
     parallax:enter, parallax:landed, parallax:complete
   (detail: { section, complete }), so add-ons can hook in
   without touching this file.
   ============================================================ */
const DEFAULTS = {
  watch: '.stage-sticky', // element inside root that triggers; falls back to root
  when: 'enter', // 'enter' (partly visible) or 'full' (fully visible)
  threshold: 0.1, // for when: 'enter'
  reveal: [], // selectors that get .in-view on trigger
  landing: null, // selector whose entrance animation marks "landed"; defaults to the last reveal
  pop: null, // { targets, windowMs, popDuration, hoverVariance }
  scrub: null // { target, start, end, from, to, unit, property }
};

/* ---------- low-level helpers (also exported for one-off use) ---------- */

/** Calls cb once, the first time el is at least `threshold` visible. */
export function onEnterView(el, cb, { threshold = 0.1, root = null } = {}) {
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        io.disconnect();
        cb(entry);
      }
    }
  }, { threshold, root });
  io.observe(el);
  return io;
}

/** Calls cb once, the first time el is fully on screen. */
export function onFullyInView(el, cb, { root = null } = {}) {
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      // 0.99, not 1: absorbs sub-pixel rounding at some zoom levels
      if (entry.isIntersecting && entry.intersectionRatio >= 0.99) {
        io.disconnect();
        cb(entry);
      }
    }
  }, { threshold: [0.99, 1], root });
  io.observe(el);
  return io;
}

/** Calls cb once when el's OWN CSS animation ends (ignores animations bubbling up from children). */
export function onAnimationEnd(el, cb) {
  el.addEventListener('animationend', function handler(e) {
    if (e.target !== el) return;
    el.removeEventListener('animationend', handler);
    cb(e);
  });
}

/**
 * Calls mapFn(progress 0..1) on every animation frame while the page
 * scrolls, measured across wrapperEl's pinned range (wrapper height
 * minus one viewport). Returns { update, destroy }.
 */
export function scrollScrub(wrapperEl, mapFn) {
  let ticking = false;
  const tick = () => {
    const total = wrapperEl.offsetHeight - window.innerHeight;
    const raw = total > 0 ? -wrapperEl.getBoundingClientRect().top / total : 0;
    mapFn(Math.min(1, Math.max(0, raw)));
    ticking = false;
  };
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(tick);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  tick();
  return {
    update: tick,
    destroy() {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    }
  };
}

/**
 * Pops elements in (.pop-layer -> .pop-in, see disney.less), staggered so
 * the group finishes within windowMs, then switches each to a looping
 * .hover float. Resolves once the last pop-in has finished.
 */
export function popInThenHover(elements, { popDuration = 350, windowMs = 1000, hoverVariance = true } = {}) {
  const els = Array.from(elements);
  if (!els.length) return Promise.resolve();
  const span = Math.max(windowMs, popDuration);
  const stagger = els.length > 1 ? (span - popDuration) / (els.length - 1) : 0;
  els.forEach((el, i) => {
    el.style.animationDelay = `${Math.round(i * stagger)}ms`;
    el.classList.add('pop-in');
    el.addEventListener('animationend', function onPop(e) {
      if (e.target !== el || e.animationName !== 'popIn') return;
      el.removeEventListener('animationend', onPop);
      el.classList.remove('pop-in');
      if (hoverVariance) {
        // slightly different timing per element so a group floats organically
        el.style.animationDuration = `${2400 + (i % 5) * 260}ms`;
        el.style.animationDelay = `${(i % 4) * 120}ms`;
      } else {
        el.style.animationDelay = '';
      }
      el.classList.add('hover');
    });
  });
  return new Promise((resolve) => setTimeout(resolve, span + 80));
}

/* ---------- section runner ---------- */

const $all = (root, sel) => (sel ? Array.from(root.querySelectorAll(sel)) : []);

/**
 * Wires up one section from a config object (see DEFAULTS above).
 * Returns the section root, or null if it isn't on the page.
 */
export function parallaxSection(config) {
  const opts = { ...DEFAULTS, ...config };
  const root = typeof opts.root === 'string' ? document.querySelector(opts.root) : opts.root;
  if (!root) return null;

  const emit = (name, detail = {}) =>
    root.dispatchEvent(new CustomEvent(`parallax:${name}`, {
      bubbles: true,
      detail: { section: root, ...detail }
    }));

  // Scroll-scrubbed layer: moves from `from` to `to` between scroll progress
  // `start` and `end`. Past `end` the section counts as complete; scrolling
  // back above it un-completes it (complete: false).
  if (opts.scrub) {
    const s = { start: 0, end: 1, from: 0, to: 100, unit: '%', property: 'translateX', ...opts.scrub };
    const targets = $all(root, s.target);
    let done = false;
    scrollScrub(root, (progress) => {
      const t = Math.min(1, Math.max(0, (progress - s.start) / (s.end - s.start)));
      const value = s.from + t * (s.to - s.from);
      targets.forEach((el) => {
        el.style.transform = `${s.property}(${value.toFixed(2)}${s.unit})`;
      });
      if ((t >= 1) !== done) {
        done = t >= 1;
        emit('complete', { complete: done });
      }
    });
  }

  const watchEl = (opts.watch && root.querySelector(opts.watch)) || root;
  const trigger = opts.when === 'full' ? onFullyInView : onEnterView;

  trigger(watchEl, () => {
    const revealed = opts.reveal.flatMap((sel) => $all(root, sel));
    revealed.forEach((el) => el.classList.add('in-view'));
    emit('enter');

    // Scrub sections complete from scroll position, not from the entrance
    if (opts.scrub && !opts.pop) return;

    const landingEl = opts.landing ? root.querySelector(opts.landing) : revealed[revealed.length - 1];
    const afterLanding = async () => {
      emit('landed');
      if (opts.pop) {
        const { targets, ...popOpts } = opts.pop;
        await popInThenHover($all(root, targets), popOpts);
      }
      emit('complete', { complete: true });
    };
    if (landingEl && getComputedStyle(landingEl).animationName !== 'none') onAnimationEnd(landingEl, afterLanding);
    else afterLanding();
  }, { threshold: opts.threshold });

  return root;
}

/** Convenience: wire up several sections at once. */
export function parallax(sections) {
  return sections.map(parallaxSection).filter(Boolean);
}
