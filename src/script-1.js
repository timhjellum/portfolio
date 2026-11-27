// ---------------------------------------------------------------------------
// Hash-controlled modules
//
//   /                       -> everything
//   /#development,a,c       -> development + a + c   (b's HTML, JS and CSS skipped)
//   /#a                     -> just a
//
// Each module "x" is made of up to three parts, all optional:
//   HTML    any element with data-module="x" in index.html
//   script  scripts/x.js
//   styles  styles/x.less   (CodePen serves it compiled as styles/x.css)
// ---------------------------------------------------------------------------

// Every module, in load order (CSS cascade + script execution follow this order).
const MODULES = ['development', 'a', 'b', 'c'];

// Shorthands / common typos people might type in a link.
const ALIASES = { dev: 'development', developement: 'development' };

function selectedModules() {
	const raw = decodeURIComponent(location.hash.replace(/^#/, ''));
	const asked = raw
		.split(',')
		.map((s) => s.trim().toLowerCase())
		.filter(Boolean)
		.map((s) => ALIASES[s] || s);

	const picked = MODULES.filter((m) => asked.includes(m));
	// No hash, or nothing recognised -> show everything.
	return picked.length ? picked : MODULES;
}

function loadStyles(name) {
	return new Promise((resolve) => {
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = `/styles/${name}.css`;
		link.dataset.module = name;
		link.onload = link.onerror = resolve;
		document.head.appendChild(link);
	});
}

async function boot() {
	const on = selectedModules();
	document.documentElement.dataset.modules = on.join(' ');

	// 1. HTML: remove markup for modules that are off, so their scripts find nothing.
	document.querySelectorAll('[data-module]').forEach((el) => {
		if (el.tagName !== 'LINK' && !on.includes(el.dataset.module)) el.remove();
	});

	// 2. Styles: only the selected stylesheets are requested.
	await Promise.all(on.map(loadStyles));

	// Lift the pre-paint guard set in index.html.
	document.documentElement.classList.remove('modules-loading');

	// 3. Scripts: only the selected scripts are requested, run in order.
	for (const name of on) {
		try {
			await import(`/scripts/${name}.js`);
		} catch (err) {
			console.error(`[modules] ${name}.js failed to load`, err);
		}
	}
}

// Editing the hash on an open page re-runs the selection.
window.addEventListener('hashchange', () => location.reload());

boot();
