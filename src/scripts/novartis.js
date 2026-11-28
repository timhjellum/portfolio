/* ============================================================
   NOVARTIS (#nov) — mRNA helix background video
   - Pauses while the hero is off screen (saves battery/CPU).
   - Reduced motion: no playback, the poster frame stays.
   Loaded on demand by cases.js.
   ============================================================ */
function initHelix() {
	const video = document.querySelector('.nov .hero-helix');
	if (!video) return;

	const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
	const play = () => {
		if (reduce.matches) return;
		const p = video.play();
		if (p && p.catch) p.catch(() => {}); // autoplay refusal is harmless: the poster shows
	};

	if (reduce.matches) {
		video.removeAttribute('autoplay');
		video.pause();
	}
	reduce.addEventListener?.('change', () => (reduce.matches ? video.pause() : play()));

	if ('IntersectionObserver' in window) {
		new IntersectionObserver(
			([entry]) => (entry.isIntersecting ? play() : video.pause()),
			{ threshold: 0.05 }
		).observe(video.closest('.hero') || video);
	}
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initHelix);
} else {
	initHelix();
}
