/* Mango redesign — collection filtering, sorting, load more (Section Rendering API). */
(() => {
  if (window.MFCollection) return;
  const doc = document;
  let ctrl, debounceT;

  const root = (el) => el.closest('[data-mf-collection]');
  const sectionId = (r) => r.dataset.sectionId;

  function paramsFrom(r) {
    const form = r.querySelector('[data-mf-facet-form]');
    const p = new URLSearchParams();
    if (form) for (const [k, v] of new FormData(form)) if (v !== '') p.append(k, v);
    const sort = r.querySelector('[data-mf-sort]');
    if (sort && sort.value) p.set('sort_by', sort.value);
    return p;
  }

  async function render(r, url, { push = true, append = false } = {}) {
    ctrl?.abort();
    ctrl = new AbortController();
    const u = new URL(url, location.origin);
    u.searchParams.set('section_id', sectionId(r));
    r.classList.add('mf-is-loading');
    try {
      const res = await fetch(u, { signal: ctrl.signal });
      const html = await res.text();
      const next = new DOMParser().parseFromString(html, 'text/html').querySelector('[data-mf-collection]');
      if (!next) throw new Error('No section');
      if (append) {
        const grid = r.querySelector('[data-mf-grid]');
        next.querySelectorAll('[data-mf-grid] > *').forEach((c) => grid.append(c));
        const pag = r.querySelector('[data-mf-pagination]');
        const npag = next.querySelector('[data-mf-pagination]');
        if (pag) npag ? pag.replaceWith(npag) : pag.remove();
      } else {
        // Keep open/closed state of filter groups while counts update
        const openState = {};
        r.querySelectorAll('[data-mf-filter]').forEach((d) => (openState[d.dataset.mfFilter] = d.open));
        r.querySelector('[data-mf-results]').replaceWith(next.querySelector('[data-mf-results]'));
        const form = r.querySelector('[data-mf-facet-form]');
        const nform = next.querySelector('[data-mf-facet-form]');
        if (form && nform) {
          const focusedName = doc.activeElement?.name;
          form.innerHTML = nform.innerHTML;
          form.querySelectorAll('[data-mf-filter]').forEach((d) => { if (d.dataset.mfFilter in openState) d.open = openState[d.dataset.mfFilter]; });
          if (focusedName) form.querySelector(`[name="${CSS.escape(focusedName)}"]`)?.focus({ preventScroll: true });
        }
        ['[data-mf-count]', '[data-mf-active-count]', '.mf-facets-foot'].forEach((sel) => {
          const a = r.querySelector(sel), b = next.querySelector(sel);
          if (a && b) a.innerHTML = b.innerHTML;
        });
      }
      const clean = new URL(url, location.origin);
      clean.searchParams.delete('section_id');
      if (push) history.replaceState({}, '', clean.pathname + (clean.search || ''));
      window.MFSections?.init(r);
      applyDensity(r);
    } catch (e) {
      if (e.name !== 'AbortError') location.href = url; // fall back to a full page load
    } finally {
      r.classList.remove('mf-is-loading');
    }
  }

  function refresh(r) {
    const p = paramsFrom(r);
    render(r, `${location.pathname}${p.toString() ? '?' + p : ''}`);
  }

  function applyDensity(r) {
    const cols = r.dataset.mfCols || '3';
    r.querySelector('[data-mf-grid]')?.classList.toggle('mf-cols-3', cols === '3');
    r.querySelectorAll('[data-mf-cols]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mfCols === cols)));
  }

  function openFacets(r, open) {
    const f = r.querySelector('[data-mf-facets]');
    if (!f) return;
    f.classList.toggle('mf-is-open', open);
    doc.body.classList.toggle('overflow-hidden', open);
    r.querySelector('[data-mf-filter-toggle]')?.setAttribute('aria-expanded', String(open));
    if (open) setTimeout(() => f.querySelector('button, input, select')?.focus({ preventScroll: true }), 80);
  }

  doc.addEventListener('change', (e) => {
    const r = root(e.target);
    if (!r) return;
    if (e.target.matches('[data-mf-sort-mobile]')) { const s = r.querySelector('[data-mf-sort]'); if (s) s.value = e.target.value; refresh(r); return; }
    if (e.target.matches('[data-mf-sort]') || e.target.closest('[data-mf-facet-form]')) {
      if (e.target.matches('[data-mf-debounce]')) return; // handled on input
      refresh(r);
    }
  });
  doc.addEventListener('input', (e) => {
    if (!e.target.matches('[data-mf-debounce]')) return;
    const r = root(e.target);
    clearTimeout(debounceT);
    debounceT = setTimeout(() => refresh(r), 600);
  });
  doc.addEventListener('submit', (e) => {
    if (!e.target.matches('[data-mf-facet-form]')) return;
    e.preventDefault();
    refresh(root(e.target));
  });
  doc.addEventListener('click', (e) => {
    const r = root(e.target);
    if (!r) return;
    const link = e.target.closest('a[data-mf-link]');
    if (link) { e.preventDefault(); render(r, link.href); return; }
    const more = e.target.closest('[data-mf-load-more]');
    if (more) { e.preventDefault(); more.classList.add('loading'); render(r, more.href, { append: true, push: false }); return; }
    const toggle = e.target.closest('[data-mf-filter-toggle]');
    if (toggle) {
      if (matchMedia('(max-width: 989px)').matches) { openFacets(r, true); return; }
      const lay = r.querySelector('[data-mf-layout]');
      const collapsed = lay.classList.toggle('mf-filters-collapsed');
      toggle.setAttribute('aria-expanded', String(!collapsed));
      const lab = toggle.querySelector('[data-mf-filter-label]');
      if (lab) lab.textContent = collapsed ? lab.dataset.show : lab.dataset.hide;
      return;
    }
    if (e.target.closest('[data-mf-facets-close]')) { openFacets(r, false); return; }
    const d = e.target.closest('[data-mf-cols]');
    if (d) { r.dataset.mfCols = d.dataset.mfCols; applyDensity(r); }
  });
  doc.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    doc.querySelectorAll('[data-mf-facets].mf-is-open').forEach((f) => openFacets(root(f), false));
  });

  window.MFCollection = { refresh };
})();
