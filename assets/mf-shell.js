/* Mango redesign — header, mega menu, menu drawer, predictive search, announcement.
   Vanilla JS, no dependencies. Re-initialises on theme-editor section reloads. */
(() => {
  if (window.MFShell) return;
  const doc = document;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = matchMedia('(hover: hover)').matches;
  let lastFocus = null;

  /* ---------- Layers (drawer, search) ---------- */
  const LAYERS = ['MfMenuDrawer', 'MfSearchPanel'];
  const scrim = () => doc.querySelector('[data-mf-scrim]');
  const fab = () => doc.querySelector('[data-mf-fab]');

  function trap(el, e) {
    if (e.key !== 'Tab') return;
    const f = [...el.querySelectorAll('a[href], button:not([disabled]), input:not([type=hidden]), select, textarea, summary, [tabindex]:not([tabindex="-1"])')].filter((x) => x.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function open(id) {
    const el = doc.getElementById(id);
    if (!el) return;
    LAYERS.forEach((l) => l !== id && close(l, true));
    closeMega();
    lastFocus = doc.activeElement;
    el.classList.add('mf-is-open');
    scrim()?.classList.add('mf-is-open');
    doc.body.classList.add('overflow-hidden');
    doc.querySelectorAll(`[aria-controls="${id}"]`).forEach((b) => b.setAttribute('aria-expanded', 'true'));
    fab()?.classList.add('mf-is-hidden');
    setTimeout(() => (el.querySelector('input:not([type=hidden])') || el.querySelector('button, a') || el).focus({ preventScroll: true }), 60);
  }

  function close(id, silent) {
    const el = doc.getElementById(id);
    if (!el || !el.classList.contains('mf-is-open')) return;
    el.classList.remove('mf-is-open');
    doc.querySelectorAll(`[aria-controls="${id}"]`).forEach((b) => b.setAttribute('aria-expanded', 'false'));
    if (!LAYERS.some((l) => doc.getElementById(l)?.classList.contains('mf-is-open'))) {
      scrim()?.classList.remove('mf-is-open');
      doc.body.classList.remove('overflow-hidden');
      fab()?.classList.remove('mf-is-hidden');
    }
    if (!silent && lastFocus) lastFocus.focus({ preventScroll: true });
  }
  const closeAll = () => LAYERS.forEach((l) => close(l));

  /* ---------- Mega menu ---------- */
  let megaTimer;
  function openMega(id) {
    clearTimeout(megaTimer);
    doc.querySelectorAll('.mf-mega.mf-is-open').forEach((m) => m.id !== id && m.classList.remove('mf-is-open'));
    doc.querySelectorAll('[data-mf-mega]').forEach((b) => b.setAttribute('aria-expanded', String(b.dataset.mfMega === id)));
    doc.getElementById(id)?.classList.add('mf-is-open');
  }
  function closeMega() {
    doc.querySelectorAll('.mf-mega.mf-is-open').forEach((m) => m.classList.remove('mf-is-open'));
    doc.querySelectorAll('[data-mf-mega]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
  }

  /* ---------- Predictive search (Shopify Section Rendering API) ---------- */
  let searchCtrl, searchTimer;
  async function search(q) {
    const live = doc.querySelector('[data-mf-search-live]');
    const def = doc.querySelector('[data-mf-search-default]');
    if (!live) return;
    const term = q.trim();
    if (!term) { live.innerHTML = ''; if (def) def.hidden = false; return; }
    searchCtrl?.abort();
    searchCtrl = new AbortController();
    const base = (window.routes && window.routes.predictive_search_url) || '/search/suggest';
    const url = `${base}?q=${encodeURIComponent(term)}&section_id=mf-predictive-search&resources[type]=product,collection,query,article,page&resources[limit]=4&resources[limit_scope]=each&resources[options][unavailable_products]=last`;
    try {
      const res = await fetch(url, { signal: searchCtrl.signal });
      if (!res.ok) throw new Error(res.status);
      const html = await res.text();
      const dom = new DOMParser().parseFromString(html, 'text/html');
      const content = dom.querySelector('[data-mf-predictive]');
      if (def) def.hidden = true;
      live.innerHTML = content ? content.innerHTML : '';
      live.querySelectorAll('.mf-reveal').forEach((r) => r.classList.add('mf-is-in'));
    } catch (e) {
      if (e.name !== 'AbortError') live.innerHTML = '';
    }
  }

  /* ---------- Cart bubble: theme re-renders "(n)"; keep just the number ---------- */
  function tidyBubble() {
    doc.querySelectorAll('.mf-header-section #cart-icon-bubble .cart-count-bubble [aria-hidden="true"]').forEach((s) => {
      const n = s.textContent.replace(/\D+/g, '');
      if (s.textContent !== n) s.textContent = n;
    });
  }

  /* ---------- Announcement rotator ---------- */
  function initAnnouncement(scope) {
    scope.querySelectorAll('[data-mf-rotate]').forEach((rot) => {
      if (rot.dataset.mfBound) return;
      rot.dataset.mfBound = '1';
      const items = [...rot.children];
      if (items.length < 2 || reduced) return;
      let i = 0;
      const interval = Number(rot.dataset.mfRotate) * 1000 || 5000;
      let t = setInterval(step, interval);
      function step() {
        items[i].setAttribute('aria-hidden', 'true');
        i = (i + 1) % items.length;
        items[i].removeAttribute('aria-hidden');
      }
      rot.addEventListener('mouseenter', () => clearInterval(t));
      rot.addEventListener('mouseleave', () => (t = setInterval(step, interval)));
    });
  }

  /* ---------- Init / overlay mounting ---------- */
  function mountOverlays() {
    // Overlays live inside the header section in Liquid; move them to <body> so the sticky,
    // transformed header never becomes their containing block. Replace any previous copy.
    doc.querySelectorAll('.mf-header-section [data-mf-overlays]').forEach((wrap) => {
      doc.querySelectorAll(`body > [data-mf-overlays="${wrap.dataset.mfOverlays}"]`).forEach((old) => old !== wrap && old.remove());
      doc.body.appendChild(wrap);
    });
  }

  function init(scope = doc) {
    mountOverlays();
    initAnnouncement(scope);
    tidyBubble();
    const bubble = doc.querySelector('.mf-header-section #cart-icon-bubble');
    if (bubble && !bubble.dataset.mfObserved) {
      bubble.dataset.mfObserved = '1';
      new MutationObserver(tidyBubble).observe(bubble, { childList: true, subtree: true, characterData: true });
    }
    if (canHover) {
      doc.querySelectorAll('[data-mf-mega]').forEach((btn) => {
        if (btn.dataset.mfBound) return;
        btn.dataset.mfBound = '1';
        const panel = doc.getElementById(btn.dataset.mfMega);
        [btn, panel].forEach((el) => {
          if (!el) return;
          el.addEventListener('mouseenter', () => openMega(btn.dataset.mfMega));
          el.addEventListener('mouseleave', () => (megaTimer = setTimeout(closeMega, 180)));
        });
      });
    }
  }

  doc.addEventListener('click', (e) => {
    const o = e.target.closest('[data-mf-open]');
    if (o) { e.preventDefault(); open(o.dataset.mfOpen); return; }
    if (e.target.closest('[data-mf-close]') || e.target.closest('[data-mf-scrim]')) { closeAll(); return; }
    const m = e.target.closest('[data-mf-mega]');
    if (m) { const p = doc.getElementById(m.dataset.mfMega); p?.classList.contains('mf-is-open') ? closeMega() : openMega(m.dataset.mfMega); return; }
    if (!e.target.closest('.mf-mega')) closeMega();
  });
  doc.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeAll(); closeMega(); return; }
    const openLayer = LAYERS.map((l) => doc.getElementById(l)).find((el) => el?.classList.contains('mf-is-open'));
    if (openLayer) trap(openLayer, e);
  });
  doc.addEventListener('input', (e) => {
    if (!e.target.matches('[data-mf-search-input]')) return;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => search(e.target.value), 220);
  });

  /* Header: hide on scroll down, show on scroll up */
  let lastY = scrollY, ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const sec = doc.querySelector('.mf-header-section');
      const header = doc.querySelector('.mf-site-header');
      if (sec && header) {
        const y = scrollY;
        header.classList.toggle('mf-is-scrolled', y > 8);
        const hide = y > 240 && y > lastY && !doc.querySelector('.mf-mega.mf-is-open') && !doc.body.classList.contains('overflow-hidden');
        sec.classList.toggle('mf-is-hidden', hide);
        doc.documentElement.classList.toggle('mf-header-hidden', hide);
        lastY = y;
      }
      ticking = false;
    });
  }, { passive: true });

  // Hide the WhatsApp button while the theme cart drawer is open
  const watchDrawer = () => {
    const d = doc.querySelector('cart-drawer');
    if (!d || d.dataset.mfObserved) return;
    d.dataset.mfObserved = '1';
    new MutationObserver(() => fab()?.classList.toggle('mf-is-hidden', d.classList.contains('active'))).observe(d, { attributes: true, attributeFilter: ['class'] });
  };

  window.MFShell = { open, close, closeAll };
  // Policy pages: place the policy tabs (rendered by sections/mf-header.liquid) under the title
  const policyTabs = () => {
    const tpl = doc.querySelector('template[data-mf-policy-tabs]');
    const title = doc.querySelector('.shopify-policy__title');
    if (tpl && title && !doc.querySelector('.shopify-policy__title + .mf-policy-tabs')) title.after(tpl.content.cloneNode(true));
  };

  const boot = () => { init(); watchDrawer(); policyTabs(); };
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot); else boot();
  doc.addEventListener('shopify:section:load', (e) => init(e.target));
})();
