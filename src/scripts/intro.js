import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

/* ============================================================
   INTRO: pinned while you scroll
     1. the headline travels across the screen (right -> left)
     2. the paragraph rises in
     3. the scroll cue fades in
   Plus: the landing screen's scroll cue fades away as you start
   scrolling. With reduced motion, the section stays static.
   ============================================================ */
function initIntro() {
  // landing cue: fade out over the first ~25% of a screen of scroll
  const landingCue = document.querySelector(".landing .scroll-cue");
  if (landingCue) {
    gsap.to(landingCue, {
      autoAlpha: 0,
      ease: "none",
      scrollTrigger: {
        start: 0,
        end: () => window.innerHeight * 0.25,
        scrub: true,
      },
    });
  }

  const intro = document.querySelector(".intro");
  if (!intro) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const title = intro.querySelector("h1");
  const text = intro.querySelector("p");
  const cue = intro.querySelector(".scroll-cue");
  if (!title || !text) return;

  intro.classList.add("is-animated");

  const viewW = () => document.documentElement.clientWidth;

  gsap.set(text, { autoAlpha: 0, y: 40 });
  if (cue) gsap.set(cue, { autoAlpha: 0 });

  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: intro,
      start: "top top",
      end: () => "+=" + window.innerHeight * 3, // 3 screens of scroll while pinned
      scrub: true,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      // this pin sits above the horizontal case studies but its script loads
      // later, so give it priority when ScrollTrigger measures the page
      refreshPriority: 1,
    },
  });

  tl.fromTo(
    title,
    { x: () => viewW() },                 // starts just off the right edge
    { x: () => -(title.scrollWidth + 80), duration: 0.6 } // ends fully off the left edge (80px clears glyph overhang)
  )
    .to(text, { autoAlpha: 1, y: 0, duration: 0.15, ease: "power2.out" }, ">-0.05")
    .to(cue || {}, { autoAlpha: 1, duration: 0.08 }, ">+0.04")
    .to({}, { duration: 0.12 }); // short hold so the paragraph can be read before unpinning
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initIntro);
} else {
  initIntro();
}
