/* FOOTER PARALLAX — always loaded (imported in script.js).
   The footer slides up from under the page while a dark layer fades off it. */
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function initFooterParallax() {
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	document.querySelectorAll('[data-footer-parallax]').forEach((el) => {
		const inner = el.querySelector('[data-footer-parallax-inner]');
		const dark = el.querySelector('[data-footer-parallax-dark]');
		if (!inner && !dark) return;

		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: el,
				start: 'clamp(top bottom)',
				end: 'clamp(top top)',
				scrub: true,
			},
		});

		if (inner) tl.from(inner, { yPercent: -25, ease: 'none' });
		if (dark) tl.from(dark, { opacity: 0.5, ease: 'none' }, '<');
	});
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initFooterParallax);
} else {
	initFooterParallax();
}
