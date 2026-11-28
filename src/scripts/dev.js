/* DEV OVERLAY — loaded only when the URL hash contains #dev (see cases.js).
   The breakpoint name and colour come from styles/dev.less; this adds the live width.
   window.innerWidth includes the scrollbar, the same width media queries use. */
const output = document.createElement('div');
output.id = 'output';
output.setAttribute('aria-hidden', 'true');

const px = document.createElement('span');
px.className = 'output__px';
output.append(px);
document.body.append(output);

const update = () => {
	px.textContent = `${window.innerWidth}px`;
};
update();
window.addEventListener('resize', update, { passive: true });
