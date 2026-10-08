/* Mango redesign — shared behaviour for mf-* sections. Vanilla JS, no dependencies.
   Safe to load more than once: everything is guarded and re-initialised per section. */
(() => {
  if (window.MFSections) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Scroll reveals ------------------------------------------------------- */
  const io = 'IntersectionObserver' in window && !reduced
    ? new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add('mf-is-in'); io.unobserve(e.target); }
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 })
    : null;

  function initReveals(scope) {
    scope.querySelectorAll('.mf-reveal:not(.mf-is-in)').forEach((el) => (io ? io.observe(el) : el.classList.add('mf-is-in')));
  }

  /* Shop-the-look hotspots (tap to toggle on touch) ---------------------- */
  function initHotspots(scope) {
    scope.querySelectorAll('.mf-hotspot').forEach((btn) => {
      if (btn.dataset.mfBound) return;
      btn.dataset.mfBound = '1';
      btn.addEventListener('click', () => {
        const open = btn.getAttribute('aria-expanded') !== 'true';
        scope.querySelectorAll('.mf-hotspot').forEach((b) => b.setAttribute('aria-expanded', 'false'));
        btn.setAttribute('aria-expanded', String(open));
      });
    });
  }

  /* Add several variants at once, then refresh the theme's cart drawer ---- */
  function initAddAll(scope) {
    scope.querySelectorAll('[data-mf-add-all]').forEach((btn) => {
      if (btn.dataset.mfBound) return;
      btn.dataset.mfBound = '1';
      btn.addEventListener('click', async () => {
        const ids = (btn.dataset.mfAddAll || '').split(',').filter(Boolean);
        if (!ids.length) return;
        const drawer = document.querySelector('cart-drawer');
        const body = { items: ids.map((id) => ({ id: Number(id), quantity: 1 })) };
        if (drawer && drawer.getSectionsToRender) {
          body.sections = drawer.getSectionsToRender().map((s) => s.id);
          body.sections_url = window.location.pathname;
        }
        btn.classList.add('loading');
        btn.setAttribute('aria-disabled', 'true');
        try {
          const res = await fetch(`${(window.routes && window.routes.cart_add_url) || '/cart/add'}.js`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(body),
          });
          const data = await res.json();
          if (!res.ok || data.status) throw new Error(data.description || data.message || 'Could not add to cart');
          // PUB_SUB_EVENTS is a top-level const in the theme's constants.js (global scope, not window).
          if (typeof publish === 'function' && typeof PUB_SUB_EVENTS !== 'undefined') {
            publish(PUB_SUB_EVENTS.cartUpdate, { source: 'mf-shop-the-look' });
          }
          if (drawer && data.sections) drawer.renderContents(data);
          else window.location = (window.routes && window.routes.cart_url) || '/cart';
        } catch (err) {
          const msg = scope.querySelector('[data-mf-add-all-error]');
          if (msg) { msg.textContent = err.message; msg.hidden = false; }
        } finally {
          btn.classList.remove('loading');
          btn.removeAttribute('aria-disabled');
        }
      });
    });
  }

  /* Product recommendations: fetch the section from the recommendations API ---- */
  function initRecs(scope) {
    scope.querySelectorAll('[data-mf-recs]').forEach(async (el) => {
      if (el.dataset.mfBound || el.querySelector('[data-mf-scroller]')) return;
      el.dataset.mfBound = '1';
      try {
        const html = await (await fetch(el.dataset.mfRecs)).text();
        const fresh = new DOMParser().parseFromString(html, 'text/html').querySelector('[data-mf-recs]');
        if (fresh && fresh.innerHTML.trim()) { el.innerHTML = fresh.innerHTML; initReveals(el); }
        else el.hidden = true;
      } catch (e) { el.hidden = true; }
    });
  }

  function init(scope = document) {
    initReveals(scope);
    initHotspots(scope);
    initAddAll(scope);
    initRecs(scope);
  }

  /* Horizontal scroller arrows ([data-mf-scroll] next to a [data-mf-scroller]) */
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-mf-scroll]');
    if (!b) return;
    const s = b.closest('.mf-container, .mf')?.querySelector('[data-mf-scroller]');
    if (s) s.scrollBy({ left: s.clientWidth * 0.75 * Number(b.dataset.mfScroll), behavior: reduced ? 'auto' : 'smooth' });
  });

  window.MFSections = { init };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => init());
  else init();

  // Theme editor: re-initialise sections when they are added, edited or reordered.
  document.addEventListener('shopify:section:load', (e) => init(e.target));
  document.addEventListener('shopify:block:select', (e) => {
    const el = e.target.closest('.mf-reveal') || e.target.querySelector('.mf-reveal');
    e.target.querySelectorAll('.mf-reveal').forEach((r) => r.classList.add('mf-is-in'));
    if (el) el.classList.add('mf-is-in');
  });
})();
