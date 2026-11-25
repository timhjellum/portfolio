/* ============================================================
   DISNEY SECTIONS (ported from the Disney CodePen)
   One config object per section; selectors are scoped to the
   section root, so the same class names can be reused freely.
   To add a section: copy a block and change the selectors.
   ============================================================ */
import { parallax } from './disney-parallax.js';
import { initWeddings } from './disney-weddings.js';

function initDisney() {
  const disney = document.querySelector('.disney');
  if (!disney) return;

  parallax([
    {
      // Meetings & Events: sun + header on enter, train scrubbed across with scroll
      root: '#me-wrapper',
      watch: null, // trigger on the tall wrapper itself
      threshold: 0.1,
      reveal: ['.sun-layer', '.header-layer'],
      scrub: { target: '.train-layer', start: 0.05, end: 0.92, from: -140, to: 140, unit: '%' }
    },
    {
      // Weddings & Honeymoons: waits until the stage is fully on screen
      root: '#wh-section',
      when: 'full',
      reveal: ['.sky-layer', '.character-layer'],
      landing: '.character-layer'
    },
    {
      // Videos: character bounces in, then the 12 accent shapes pop and float
      root: '#disney-videos',
      threshold: 0.25,
      reveal: ['.character-layer'],
      pop: { targets: '.blob-layer' }
    },
    {
      // Interactive Maps: map slides up, then the callout pops and floats
      root: '#disney-maps',
      threshold: 0.25,
      reveal: ['.map-layer'],
      pop: { targets: '.callout-layer', windowMs: 350, hoverVariance: false }
    }
  ]);

  initWeddings();
  initReadMore(disney);
}

/* ============================================================
   READ MORE (mobile)
   Adds a "More" button to each Disney section header. On small
   screens (see disney.less) the description is hidden and this
   button opens it in a bottom sheet. Uses <dialog>, so Esc,
   focus trapping and returning focus to the button are built in.
   Scoped to .disney so it never touches other sections' headers.
   ============================================================ */
function initReadMore(scope) {
  const boxes = scope.querySelectorAll('.header-layer > div:first-child');
  if (!boxes.length) return;

  const sheet = document.createElement('dialog');
  sheet.className = 'more-sheet';
  sheet.setAttribute('aria-labelledby', 'more-sheet-title');
  sheet.innerHTML = `
    <div class="more-sheet__inner">
      <button type="button" class="more-sheet__close" aria-label="Close">&times;</button>
      <div class="more-sheet__content"></div>
    </div>`;
  document.body.append(sheet);

  const content = sheet.querySelector('.more-sheet__content');
  sheet.querySelector('.more-sheet__close').addEventListener('click', () => sheet.close());
  // tapping the dimmed backdrop (outside the sheet itself) closes it
  sheet.addEventListener('click', (e) => {
    if (e.target === sheet) sheet.close();
  });

  boxes.forEach((box) => {
    const title = box.querySelector('h2');
    const text = box.querySelector('p');
    if (!title || !text) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'more-btn btn primary'; // same look as the site's primary buttons
    btn.textContent = 'More…';
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.setAttribute('aria-label', `More about ${title.textContent.replace(/\s+/g, ' ').trim()}`);
    box.append(btn);
    btn.addEventListener('click', () => {
      content.replaceChildren(
        ...[box.querySelector('h1'), title, text].filter(Boolean).map((el) => el.cloneNode(true))
      );
      content.querySelector('h2').id = 'more-sheet-title';
      sheet.showModal();
      sheet.querySelector('.more-sheet__inner').scrollTop = 0;
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDisney);
} else {
  initDisney();
}
