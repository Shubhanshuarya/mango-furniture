/* Mango redesign — client-side form validation (before Shopify's native submit) and FAQ search/nav. */
(() => {
  if (window.MFForms) return;
  const doc = document;

  function valid(input) {
    if (input.type === 'checkbox') return !input.required || input.checked;
    if (input.type === 'radio') return !input.required || !!input.form?.querySelector(`input[name="${CSS.escape(input.name)}"]:checked`);
    return input.checkValidity() && (!input.required || input.value.trim() !== '');
  }

  function validate(form) {
    const bad = [];
    form.querySelectorAll('.mf-field').forEach((f) => {
      const inputs = [...f.querySelectorAll('input:not([type=hidden]), select, textarea')];
      const ok = inputs.every(valid);
      f.classList.toggle('mf-has-error', !ok);
      inputs.forEach((i) => (ok ? i.removeAttribute('aria-invalid') : i.setAttribute('aria-invalid', 'true')));
      if (!ok) bad.push(inputs[0]);
    });
    const sum = form.querySelector('.mf-form-status--error');
    if (sum) {
      sum.classList.toggle('mf-is-visible', bad.length > 0);
      const c = sum.querySelector('[data-mf-error-count]');
      if (c && bad.length) c.textContent = bad.length === 1 ? (c.dataset.one || '1 field needs attention.') : (c.dataset.many || '{n} fields need attention.').replace('{n}', bad.length);
    }
    return bad;
  }

  doc.addEventListener('submit', (e) => {
    const form = e.target.closest('form[data-mf-validate]');
    if (!form) return;
    if (e.submitter?.hasAttribute('data-mf-skip-validate')) return;
    const bad = validate(form);
    if (bad.length) { e.preventDefault(); bad[0].focus(); return; }
    form.querySelector('[type=submit]')?.classList.add('loading');
  }, true);
  doc.addEventListener('input', (e) => {
    const f = e.target.closest('form[data-mf-validate] .mf-field.mf-has-error');
    if (f && valid(e.target)) { f.classList.remove('mf-has-error'); e.target.removeAttribute('aria-invalid'); }
  });
  doc.addEventListener('focusout', (e) => {
    const f = e.target.closest?.('form[data-mf-validate] .mf-field');
    if (f && e.target.value && !valid(e.target)) f.classList.add('mf-has-error');
  });

  // Bring success/error messages into view after Shopify's redirect back to the page
  const shown = doc.querySelector('form[data-mf-validate] .mf-form-status.mf-is-visible');
  if (shown) { shown.scrollIntoView({ block: 'center' }); shown.focus({ preventScroll: true }); }

  /* FAQ: live search + section nav highlighting */
  function initFaq(root) {
    if (root.dataset.mfBound) return;
    root.dataset.mfBound = '1';
    const search = root.querySelector('[data-mf-faq-search]');
    const empty = root.querySelector('[data-mf-faq-empty]');
    search?.addEventListener('input', () => {
      const q = search.value.trim().toLowerCase();
      let any = false;
      root.querySelectorAll('[data-mf-faq-group]').forEach((g) => {
        let n = 0;
        g.querySelectorAll('details').forEach((d) => {
          const hit = !q || d.textContent.toLowerCase().includes(q);
          d.hidden = !hit;
          if (hit) n++;
          if (q && hit) d.open = true;
        });
        g.hidden = !n;
        any ||= n > 0;
      });
      if (empty) empty.hidden = any;
    });
    const links = [...root.querySelectorAll('[data-mf-faq-nav] a')];
    if (links.length && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver((ens) => ens.forEach((en) => {
        if (en.isIntersecting) links.forEach((a) => a.setAttribute('aria-current', String(a.hash === '#' + en.target.id)));
      }), { rootMargin: '-30% 0px -60% 0px' });
      root.querySelectorAll('[data-mf-faq-group]').forEach((g) => io.observe(g));
    }
  }
  const boot = (scope = doc) => scope.querySelectorAll('[data-mf-faq]').forEach(initFaq);
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', () => boot()); else boot();
  doc.addEventListener('shopify:section:load', (e) => boot(e.target));
  window.MFForms = { validate };
})();
