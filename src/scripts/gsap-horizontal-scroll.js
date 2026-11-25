import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

function initHorizontalScrolling() {
  const mm = gsap.matchMedia();

  mm.add(
    {
      isMobile: "(max-width:479px)",
      isMobileLandscape: "(max-width:767px)",
      isTablet: "(max-width:991px)",
      isDesktop: "(min-width:992px)"
    },
    (context) => {
      const { isMobile, isMobileLandscape, isTablet } = context.conditions;
      const snapHandlers = [];

      const ctx = gsap.context(() => {
        const wrappers = document.querySelectorAll("[data-horizontal-scroll-wrap]");
        if (!wrappers.length) return;

        wrappers.forEach((wrap) => {
          // optional disable logic per breakpoint
          const disable = wrap.getAttribute("data-horizontal-scroll-disable");
          if (
            (disable === "mobile" && isMobile) ||
            (disable === "mobileLandscape" && isMobileLandscape) ||
            (disable === "tablet" && isTablet)
          ) {
            return; // skip this wrapper on specified breakpoint
          }

          const panels = gsap.utils.toArray("[data-horizontal-scroll-panel]", wrap);
          if (panels.length < 2) return;

          // Index the panels (handy for styling/debugging: [data-panel-index="1"])
          panels.forEach((panel, i) => panel.setAttribute("data-panel-index", i));

          // Visible width = viewport minus scrollbar (matches the pinned wrap width)
          const viewW = () => document.documentElement.clientWidth;
          const distance = () => Math.max(1, wrap.scrollWidth - viewW());

          const tween = gsap.to(panels, {
            x: () => -distance(),
            ease: "none",
            scrollTrigger: {
              trigger: wrap,
              start: "top top",
              end: () => "+=" + distance(),
              scrub: true,
              pin: true,
              pinSpacing: true,
              invalidateOnRefresh: true,
            },
          });

          const st = tween.scrollTrigger;

          // Snap: when scrolling stops inside the pinned range, glide so the
          // nearest panel's upper-left corner sits at the viewport's upper-left.
          const snapPoints = () =>
            panels.map((p) => Math.min(1, p.offsetLeft / distance()));

          const onScrollEnd = () => {
            if (!st || !st.isActive) return;
            const points = snapPoints();
            const progress = st.progress;
            const nearest = points.reduce((a, b) =>
              Math.abs(b - progress) < Math.abs(a - progress) ? b : a
            );
            const target = st.start + nearest * (st.end - st.start);
            if (Math.abs(window.scrollY - target) < 2) return;

            if (window.lenis) {
              window.lenis.scrollTo(target, { duration: 0.6 });
            } else {
              window.scrollTo({ top: target, behavior: "smooth" });
            }
          };

          ScrollTrigger.addEventListener("scrollEnd", onScrollEnd);
          snapHandlers.push(onScrollEnd);

          // Exit parallax: once the last panel finishes and the page scrolls
          // vertically again, elements marked [data-exit-parallax="0.5"] leave
          // the screen at that fraction of the floor's speed (floor = 1).
          const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          const lastPanel = panels[panels.length - 1];
          if (!reduceMotion) {
            gsap.utils.toArray("[data-exit-parallax]", lastPanel).forEach((el) => {
              const speed = parseFloat(el.getAttribute("data-exit-parallax"));
              const lag = 1 - (Number.isFinite(speed) ? speed : 0.5);
              gsap.fromTo(
                el,
                { y: 0 },
                {
                  y: () => window.innerHeight * lag,
                  ease: "none",
                  scrollTrigger: {
                    start: () => st.end,                      // horizontal ride is over
                    end: () => st.end + window.innerHeight,   // panel fully scrolled away
                    scrub: true,
                    invalidateOnRefresh: true,
                  },
                }
              );
            });
          }
        });
      });

      return () => {
        snapHandlers.forEach((fn) => ScrollTrigger.removeEventListener("scrollEnd", fn));
        ctx.revert(); // cleanup
      };
    }
  );
}

// Initialize Horizontal Scrolling Sections
document.addEventListener("DOMContentLoaded", () => {
  initHorizontalScrolling();
});