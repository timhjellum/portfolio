/* ============================================================
   CASE STUDIES — chosen by the URL hash
   ------------------------------------------------------------
     /                 every case study
     /#mc,dis          Mastercard + Disney only
     /#uf              Underground Films only
   Codes can be in any order or case; unknown codes are ignored.
   If the hash has no recognised code, DEFAULT_CASES is shown.

   Each case study's HTML lives in index.html inside
   <template data-case="xx">. Only the selected templates are
   stamped into the page, so the others' markup, images, styles
   and scripts are never loaded. Everything not listed here
   (intro, FASTSIGNS, nav, …) always loads.

   To add a case: wrap its HTML in <template data-case="xx">
   and add an entry below.
   ============================================================ */
import ScrollTrigger from 'gsap/ScrollTrigger';

const CASES = {
	fs: {
		css: () => import(/* webpackChunkName: "case-fs" */ '../styles/fastsigns.less'),
		js: () =>
			Promise.all([
				import(/* webpackChunkName: "case-fs" */ './gsap-globe.js'),
				import(/* webpackChunkName: "case-fs" */ './fastsigns.js'),
			]),
	},
	mc: {
		css: () => import(/* webpackChunkName: "case-mc" */ '../styles/mastercard.less'),
	},
	uf: {
		css: () => import(/* webpackChunkName: "case-uf" */ '../styles/underground-films.less'),
		js: () =>
			Promise.all([
				import(/* webpackChunkName: "case-uf" */ './gsap-tabs.js'),
				import(/* webpackChunkName: "case-uf" */ './show-less-more.js'),
			]),
	},
	tra: {
		css: () => import(/* webpackChunkName: "case-tra" */ '../styles/travel.less'),
	},
	om: {
		css: () => import(/* webpackChunkName: "case-om" */ '../styles/orlando-magic.less'),
	},
	dis: {
		css: () => import(/* webpackChunkName: "case-dis" */ '../styles/disney.less'),
		js: () => import(/* webpackChunkName: "case-dis" */ './disney.js'),
	},
	imf: {
		css: () => import(/* webpackChunkName: "case-imf" */ '../styles/international-monetary-fund.less'),
		js: () => import(/* webpackChunkName: "case-imf" */ './international-monetary-fund.js'),
	},
};

const ALL = Object.keys(CASES);

// Shown when the hash names no known case (or there is no hash at all).
// Edit this list to change what a plain link shows, e.g. ['fs', 'mc', 'dis'].
const DEFAULT_CASES = ['fs', 'mc', 'uf', 'tra', 'om', 'dis', 'imf'];

function selectedCases() {
	const asked = decodeURIComponent(location.hash.replace(/^#/, ''))
		.split(',')
		.map((s) => s.trim().toLowerCase())
		.filter(Boolean);
	const picked = ALL.filter((code) => asked.includes(code));
	return picked.length ? picked : ALL.filter((code) => DEFAULT_CASES.includes(code));
}

const on = selectedCases();
document.documentElement.dataset.cases = on.join(' ');

// 1. HTML — runs as soon as this module is evaluated (before DOMContentLoaded),
//    so the always-loaded scripts (horizontal scroll, etc.) see the final markup.
document.querySelectorAll('template[data-case]').forEach((tpl) => {
	if (on.includes(tpl.dataset.case)) {
		const frag = tpl.content.cloneNode(true);
		frag.querySelectorAll(':scope > *').forEach((el) => (el.dataset.case = tpl.dataset.case));
		tpl.replaceWith(frag);
	} else {
		tpl.remove();
	}
});

// If none of the horizontal-scroll cases (fs, imf, mc, tra, om) were picked, drop the empty scroller.
document.querySelectorAll('[data-horizontal-scroll-wrap]').forEach((wrap) => {
	if (!wrap.querySelector('[data-horizontal-scroll-panel]')) wrap.remove();
});

async function loadCases() {
	// 2. Styles first, so section scripts measure real layout.
	const cssResults = await Promise.allSettled(on.map((code) => CASES[code].css?.()));
	cssResults.forEach((r, i) => {
		if (r.status === 'rejected') console.error(`[cases] #${on[i]} styles failed`, r.reason);
	});

	// Reveal (see the .cases-loading guard in index.html).
	document.documentElement.classList.remove('cases-loading');

	// 3. Section scripts.
	const jsResults = await Promise.allSettled(on.map((code) => CASES[code].js?.()));
	jsResults.forEach((r, i) => {
		if (r.status === 'rejected') console.error(`[cases] #${on[i]} script failed`, r.reason);
	});

	// Pinned/horizontal sections were measured before the case styles arrived.
	ScrollTrigger.refresh();
}

loadCases();

// Changing the hash on an open page re-runs the selection.
window.addEventListener('hashchange', () => location.reload());
