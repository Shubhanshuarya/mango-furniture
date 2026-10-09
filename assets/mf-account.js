/* Mango redesign — classic customer account pages (sections/mf-main-login, -register, -addresses,
   -activate-account, -reset-password). Vanilla JS; forms still submit natively to Shopify. */
(() => {
  if (window.MFAccount) return;
  const doc = document;

  /* Show / hide password */
  doc.addEventListener('click', (e) => {
    const b = e.target.closest('[data-mf-pw-toggle]');
    if (!b) return;
    const input = doc.getElementById(b.getAttribute('aria-controls'));
    if (!input) return;
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    b.textContent = show ? b.dataset.hide : b.dataset.show;
    b.setAttribute('aria-pressed', String(show));
  });

  /* Sign in ↔ password recovery panels (#recover, as in the original theme) */
  const login = doc.querySelector('[data-mf-login-panel]');
  const recover = doc.querySelector('[data-mf-recover-panel]');
  function showRecover(on, focus = true) {
    if (!login || !recover) return;
    login.hidden = on;
    recover.hidden = !on;
    if (focus) (on ? recover.querySelector('h1, input') : login.querySelector('input'))?.focus();
  }
  doc.addEventListener('click', (e) => {
    if (e.target.closest('[data-mf-recover-open]')) { e.preventDefault(); showRecover(true); history.replaceState(null, '', '#recover'); }
    if (e.target.closest('[data-mf-recover-close]')) { e.preventDefault(); showRecover(false); history.replaceState(null, '', location.pathname + location.search); }
  });
  if (location.hash === '#recover') showRecover(true, false);

  /* Bring server messages (errors / success) into view */
  const msg = doc.querySelector('[data-mf-autofocus]');
  if (msg) { msg.scrollIntoView({ block: 'center' }); msg.focus({ preventScroll: true }); }

  /* Confirm password must match */
  doc.querySelectorAll('[data-mf-match-target]').forEach((c) => {
    const p = doc.getElementById(c.dataset.mfMatchTarget);
    const check = () => c.setCustomValidity(c.value && p && c.value !== p.value ? 'mismatch' : '');
    c.addEventListener('input', check);
    p?.addEventListener('input', check);
  });

  /* Addresses: open/close add & edit forms */
  function setForm(key, open) {
    const panel = doc.getElementById(`MfAddressForm-${key}`);
    if (!panel) return;
    panel.hidden = !open;
    doc.querySelectorAll(`[aria-controls="MfAddressForm-${key}"]`).forEach((b) => b.setAttribute('aria-expanded', String(open)));
    if (open) panel.querySelector('input:not([type=hidden])')?.focus();
  }
  doc.addEventListener('click', (e) => {
    const t = e.target.closest('[data-mf-address-toggle]');
    if (t) { const key = t.dataset.mfAddressToggle; setForm(key, doc.getElementById(`MfAddressForm-${key}`)?.hidden); }

    const d = e.target.closest('[data-mf-address-delete]');
    if (d && window.confirm(d.dataset.confirm)) {
      const f = doc.createElement('form');
      f.method = 'post';
      f.action = d.dataset.mfAddressDelete;
      f.innerHTML = '<input type="hidden" name="_method" value="delete">';
      doc.body.append(f);
      f.submit();
    }
  });
  doc.querySelectorAll('[data-mf-open-form]').forEach((s) => setForm(s.dataset.mfOpenForm, true));

  /* Country → province selects (Shopify.CountryProvinceSelector from shopify_common.js) */
  function initCountries() {
    if (!(window.Shopify && Shopify.CountryProvinceSelector)) return;
    doc.querySelectorAll('[data-mf-country]').forEach((sel) => {
      const key = sel.dataset.mfCountry;
      new Shopify.CountryProvinceSelector(`MfAddrCountry-${key}`, `MfAddrProvince-${key}`, { hideElement: `MfAddrProvinceWrap-${key}` });
    });
  }
  if (doc.readyState === 'complete') initCountries(); else addEventListener('load', initCountries);

  window.MFAccount = { showRecover, setForm };
})();
