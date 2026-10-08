/* Mango redesign — cart page quantity/remove/note via the Cart AJAX API + Section Rendering. */
(() => {
  if (window.MFCart) return;
  const doc = document;
  const routes = window.routes || {};
  let noteT, busy = false;

  async function change(root, line, quantity, row) {
    if (busy) return;
    busy = true;
    root.classList.add('mf-is-loading');
    row?.classList.add('mf-is-removing');
    try {
      const res = await fetch(`${routes.cart_change_url || '/cart/change'}.js`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ line, quantity, sections: [root.dataset.sectionId, 'cart-icon-bubble'], sections_url: location.pathname }),
      });
      const data = await res.json();
      if (!res.ok || data.status) throw new Error(data.description || data.message || 'Error');
      const html = data.sections?.[root.dataset.sectionId];
      const fresh = html && new DOMParser().parseFromString(html, 'text/html').querySelector('[data-mf-cart]');
      if (fresh) root.innerHTML = fresh.innerHTML; else location.reload();
      const bubble = doc.getElementById('cart-icon-bubble');
      const bHtml = data.sections?.['cart-icon-bubble'];
      if (bubble && bHtml) {
        const b = new DOMParser().parseFromString(bHtml, 'text/html').querySelector('.shopify-section');
        if (b) bubble.innerHTML = b.innerHTML;
      }
      if (typeof publish === 'function' && typeof PUB_SUB_EVENTS !== 'undefined') publish(PUB_SUB_EVENTS.cartUpdate, { source: 'mf-cart' });
    } catch (e) {
      row?.classList.remove('mf-is-removing');
      const err = row?.querySelector('[data-mf-line-error]');
      if (err) { err.textContent = e.message; err.style.display = 'flex'; }
    } finally {
      busy = false;
      root.classList.remove('mf-is-loading');
    }
  }

  doc.addEventListener('click', (e) => {
    const root = e.target.closest('[data-mf-cart]');
    if (!root) return;
    const row = e.target.closest('[data-mf-line]');
    const step = e.target.closest('[data-mf-cart-qty]');
    if (step && row) {
      const input = row.querySelector('[data-mf-cart-input]');
      const q = Math.max(0, (+input.value || 0) + +step.dataset.mfCartQty);
      input.value = q;
      change(root, +row.dataset.index, q, q === 0 ? row : null);
      return;
    }
    if (e.target.closest('[data-mf-cart-remove]') && row) {
      e.preventDefault();
      change(root, +row.dataset.index, 0, row);
    }
  });

  doc.addEventListener('change', (e) => {
    if (!e.target.matches('[data-mf-cart-input]')) return;
    const root = e.target.closest('[data-mf-cart]');
    const row = e.target.closest('[data-mf-line]');
    const q = Math.max(0, parseInt(e.target.value, 10) || 0);
    change(root, +row.dataset.index, q, q === 0 ? row : null);
  });

  doc.addEventListener('input', (e) => {
    if (!e.target.matches('[data-mf-cart-note]')) return;
    clearTimeout(noteT);
    const note = e.target.value;
    noteT = setTimeout(() => {
      fetch(`${routes.cart_update_url || '/cart/update'}.js`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ note }),
      }).catch(() => {});
    }, 500);
  });

  window.MFCart = { change };
})();
