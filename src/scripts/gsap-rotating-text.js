import gsap from "gsap";

function initRotatingText() {
  document.querySelectorAll("[data-rotating-title]").forEach((heading) => {
    const stepDuration = parseFloat(
      heading.getAttribute("data-step-duration") || "1.75"
    );
    const rotatingSpan = heading.querySelector("[data-rotating-words]");
    if (!rotatingSpan) return;

    const rawWords = rotatingSpan.getAttribute("data-rotating-words") || "";
    const words = rawWords
      .split(",")
      .map((w) => w.trim())
      .filter(Boolean);

    if (!words.length) return;

    const wrapper = document.createElement("span");
    wrapper.className = "rotating-text__inner";

    const wordEls = words.map((word) => {
      const el = document.createElement("span");
      el.className = "rotating-text__word";
      el.textContent = word;
      wrapper.appendChild(el);
      return el;
    });

    rotatingSpan.textContent = "";
    rotatingSpan.appendChild(wrapper);

    gsap.set(wordEls, { yPercent: 150, autoAlpha: 0 });

    let activeIndex = 0;
    const firstWord = wordEls[activeIndex];
    gsap.set(firstWord, { yPercent: 0, autoAlpha: 1 });
    wrapper.style.width = firstWord.getBoundingClientRect().width + "px";

    function showNext() {
      const nextIndex = (activeIndex + 1) % wordEls.length;
      const prev = wordEls[activeIndex];
      const current = wordEls[nextIndex];
      const targetWidth = current.getBoundingClientRect().width;

      gsap.to(wrapper, {
        width: targetWidth,
        duration: 0.75,
        ease: "power4.inOut"
      });

      gsap.to(prev, {
        yPercent: -150,
        autoAlpha: 0,
        duration: 0.6,
        ease: "power4.inOut"
      });

      gsap.fromTo(
        current,
        { yPercent: 150, autoAlpha: 0 },
        {
          yPercent: 0,
          autoAlpha: 1,
          duration: 0.75,
          ease: "power4.inOut"
        }
      );

      activeIndex = nextIndex;
      gsap.delayedCall(stepDuration, showNext);
    }

    if (wordEls.length > 1) {
      gsap.delayedCall(stepDuration, showNext);
    }
  });
}


// Initialize Rotating Text
 document.addEventListener("DOMContentLoaded", function () {
  initRotatingText();
});