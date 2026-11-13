/* Loading states for tanishq.design.

   Which loader:
   - Morty's face loader: the first page of a visit (any page), the Home page and the 404.
     First page of a visit: visible from the first paint for at least 1.2 s while its bar fills once, completely.
     Home / 404 later in the visit: appears only if loading takes longer than 0.4 s, then stays at least 0.6 s.
   - Skeleton: About and the case studies when reached from inside the site.

   How it leaves: when the page has drawn its content, the face loader fades out over 0.3 s. While the skeleton is
   up, the page's own content stays hidden (html.skl-hold); on reveal the skeleton fades out first (0.18 s) and the
   content fades in just after (0.22 s, starting at 0.16 s), so the two are never both visible.

   Safety nets: the page is revealed after 1 s at the most once its content exists (no waiting on fonts forever),
   after 12 s no matter what, and straight away when a page is restored by the browser's back/forward cache. */
(function () {
  var de = document.documentElement;
  var KEY = 'ta-visited', FADE = 300, FONT_WAIT = 1000, GIVE_UP = 12000;
  var page = de.getAttribute('data-page');
  var visited = false;
  try { visited = sessionStorage.getItem(KEY) === '1'; } catch (e) {}
  var mode = (page === 'about' || page === 'case') && visited ? 'skeleton' : 'cat';
  var first = mode === 'cat' && !visited;
  de.setAttribute('data-loader', mode);
  if (first) de.setAttribute('data-first-visit', '');
  if (mode === 'skeleton') de.classList.add('skl-hold');

  var SHOW_AFTER = first ? 0 : 400, MIN_SHOWN = first ? 1200 : 600;
  var shownAt = 0, done = false, showTimer, giveUp;

  function $(id) { return document.getElementById(id); }
  function remove(n) { if (n && n.parentNode) n.parentNode.removeChild(n); }

  function show() {
    if (done) return;
    var el = $('pl');
    if (!el) { showTimer = setTimeout(show, 50); return; }
    shownAt = Date.now();
    el.classList.add('on');
    if (first) el.classList.add('first');
  }

  function finish(immediate) {
    if (done) return; done = true;
    clearTimeout(showTimer); clearTimeout(giveUp);
    try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
    var pl = $('pl'), skl = $('skl');
    if (immediate) { remove(pl); remove(skl); de.classList.remove('skl-hold'); return; }
    if (mode === 'skeleton') {
      remove(pl);
      de.classList.add('skl-reveal');          /* content fades in ... */
      de.classList.remove('skl-hold');
      if (skl) skl.classList.add('out');       /* ... as the skeleton fades out */
      setTimeout(function () { remove(skl); }, 230);
      setTimeout(function () { de.classList.remove('skl-reveal'); }, 450);
      return;
    }
    remove(skl);
    if (!pl) return;
    if (!shownAt) { remove(pl); return; }      /* fast load: the loader never had to appear */
    setTimeout(function () {
      pl.classList.add('out');
      setTimeout(function () { remove(pl); }, FADE + 50);
    }, Math.max(0, MIN_SHOWN - (Date.now() - shownAt)));
  }

  if (mode === 'cat') showTimer = setTimeout(show, SHOW_AFTER);
  giveUp = setTimeout(function () { finish(false); }, GIVE_UP);

  function hasContent() {
    var r = $('dc-root');
    return !!(r && r.querySelector('main') && r.textContent.replace(/\s/g, '').length > 0);
  }
  function whenReady() {
    var fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    var cap = new Promise(function (res) { setTimeout(res, FONT_WAIT); });
    Promise.race([fonts, cap]).then(function () {
      requestAnimationFrame(function () { requestAnimationFrame(function () { finish(false); }); });
    });
  }
  document.addEventListener('DOMContentLoaded', function () {
    if (mode === 'cat') remove($('skl'));
    if (hasContent()) { whenReady(); return; }
    var mo = new MutationObserver(function () { if (hasContent()) { mo.disconnect(); whenReady(); } });
    mo.observe(document.body, { childList: true, subtree: true });
  });
  /* Back/forward cache: a restored page is already complete, so no loader may remain on it. */
  window.addEventListener('pageshow', function (e) { if (e.persisted) { done = false; finish(true); } });
})();

/* Mobile bottom menu: while the menu sheet is open the page behind it is frozen. No vertical or horizontal
   scrolling from touch, wheel or keyboard; only the menu responds. Closing the menu restores normal scrolling
   exactly where the page was. The sheet only exists while it is open, so its presence drives the lock. */
(function () {
  var de = document.documentElement, locked = false, x = 0, y = 0;
  var KEYS = { ' ': 1, PageUp: 1, PageDown: 1, End: 1, Home: 1, ArrowUp: 1, ArrowDown: 1, ArrowLeft: 1, ArrowRight: 1 };
  function inSheet(t) { return t && t.closest && t.closest('.msheet'); }
  function block(e) { if (!inSheet(e.target)) e.preventDefault(); }
  function keys(e) {
    if (!KEYS[e.key]) return;
    var t = e.target, tag = t && t.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable)) return;
    if (!inSheet(t) || e.key !== ' ') e.preventDefault();
  }
  function hold() { if (locked && (window.scrollX !== x || window.scrollY !== y)) window.scrollTo(x, y); }
  function lock() {
    if (locked) return; locked = true; x = window.scrollX; y = window.scrollY;
    de.classList.add('ta-menu-open');
    document.addEventListener('touchmove', block, { passive: false });
    document.addEventListener('wheel', block, { passive: false });
    document.addEventListener('keydown', keys, true);
    window.addEventListener('scroll', hold);
  }
  function unlock() {
    if (!locked) return; locked = false;
    de.classList.remove('ta-menu-open');
    document.removeEventListener('touchmove', block, { passive: false });
    document.removeEventListener('wheel', block, { passive: false });
    document.removeEventListener('keydown', keys, true);
    window.removeEventListener('scroll', hold);
    window.scrollTo(x, y);
  }
  function check() { if (document.querySelector('#dc-root .msheet')) lock(); else unlock(); }
  document.addEventListener('DOMContentLoaded', function () {
    new MutationObserver(check).observe(document.body, { childList: true, subtree: true });
    check();
  });
  window.addEventListener('pageshow', function (e) { if (e.persisted) check(); });
})();
