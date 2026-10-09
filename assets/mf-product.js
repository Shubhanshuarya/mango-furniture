/* Mango redesign — product page: variants, gallery, lightbox, sticky add to cart. */
(() => {
  if (window.MFProduct) return;
  const doc = document;

  function formatMoney(cents) {
    const fmt = (window.theme && window.theme.moneyFormat) || '${{amount}}';
    const v = (cents / 100).toFixed(2);
    const [i, d] = v.split('.');
    const withCommas = i.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const amount = d === '00' ? withCommas : `${withCommas}.${d}`; // trailing zeros removed, like the Liquid output
    return fmt.replace(/\{\{\s*amount[a-z_]*\s*\}\}/, amount);
  }

  function init(root) {
    if (root.dataset.mfBound) return;
    root.dataset.mfBound = '1';
    const $ = (s) => root.querySelector(s);
    const $$ = (s) => [...root.querySelectorAll(s)];
    const variantsEl = $('[data-mf-variant-json]');
    const variants = variantsEl ? JSON.parse(variantsEl.textContent) : [];
    const atc = $('[data-mf-atc]');
    const stickyBtn = $('[data-mf-sticky-atc]');
    const form = atc?.form;

    const selected = () => $$('[data-mf-option]').map((fs) => fs.querySelector('input:checked')?.value);

    function markAvailability() {
      const sel = selected();
      $$('[data-mf-option]').forEach((fs, idx) => {
        fs.querySelectorAll('input').forEach((input) => {
          const ok = variants.some((v) => v.available && v.options[idx] === input.value && v.options.every((o, j) => j === idx || o === sel[j]));
          input.classList.toggle('mf-is-unavailable', !ok);
        });
      });
    }

    function setText(sel, text) { $$(sel).forEach((el) => (el.textContent = text)); }

    function update(variant) {
      $$('[data-mf-option]').forEach((fs) => (fs.querySelector('[data-mf-option-label]').textContent = fs.querySelector('input:checked')?.value || ''));
      markAvailability();
      if (!variant) {
        if (atc) { atc.disabled = true; atc.setAttribute('aria-disabled', 'true'); atc.querySelector('span').textContent = atc.dataset.labelUnavailable; }
        if (stickyBtn) stickyBtn.disabled = true;
        return;
      }
      root.querySelectorAll('input[name="id"]').forEach((i) => { i.value = variant.id; i.dispatchEvent(new Event('change', { bubbles: true })); });
      setText('[data-mf-price-current]', formatMoney(variant.price));
      const onSale = variant.compare_at_price && variant.compare_at_price > variant.price;
      $$('[data-mf-price-compare]').forEach((el) => { el.hidden = !onSale; if (onSale) el.textContent = formatMoney(variant.compare_at_price); });
      $$('[data-mf-price-save], [data-mf-save-badge]').forEach((el) => {
        el.hidden = !onSale;
        if (onSale) el.textContent = el.textContent.replace(/[\d$€£₹.,\s]+$/, '') .trim() + ' ' + formatMoney(variant.compare_at_price - variant.price);
      });
      if (atc) {
        atc.disabled = !variant.available;
        atc.toggleAttribute('aria-disabled', !variant.available);
        atc.querySelector('span').textContent = variant.available ? atc.dataset.labelAdd : atc.dataset.labelSoldout;
      }
      if (stickyBtn) stickyBtn.disabled = !variant.available;
      const stock = $('[data-mf-stock]');
      if (stock && atc) stock.innerHTML = variant.available
        ? `<span class="mf-status mf-status--done"><i></i>${stock.dataset.inStock || 'In stock'}</span>`
        : `<span class="mf-status"><i></i>${atc.dataset.labelSoldout}</span>`;
      setText('[data-mf-sticky-variant]', `· ${variant.title}`);
      if (!root.hasAttribute('data-mf-no-url')) { // quick view must not change the page URL
        const url = new URL(location.href);
        url.searchParams.set('variant', variant.id);
        history.replaceState({}, '', url);
      }
      if (variant.featured_media) showMedia(variant.featured_media.id);
    }

    function showMedia(id) {
      const track = $('[data-mf-mtrack]');
      const m = track?.querySelector(`[data-media-id="${id}"]`);
      if (m && track.offsetParent !== null) track.scrollTo({ left: m.offsetLeft, behavior: 'smooth' });
      const g = $(`[data-mf-gallery] [data-media-id="${id}"]`);
      if (g && $('[data-mf-gallery]').offsetParent !== null) {
        const r = g.getBoundingClientRect();
        if (r.top < 0 || r.bottom > innerHeight) g.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }

    // Stock label text from Liquid (translated) for client-side updates
    const stock = $('[data-mf-stock]');
    if (stock) stock.dataset.inStock = stock.textContent.trim() && !$('[data-mf-atc]')?.disabled ? stock.textContent.trim() : (stock.dataset.inStock || 'In stock');

    root.addEventListener('change', (e) => {
      if (!e.target.closest('[data-mf-option]')) return;
      const sel = selected();
      update(variants.find((v) => v.options.every((o, i) => o === sel[i])));
    });
    if (variants.length) markAvailability();

    // Quantity
    root.addEventListener('click', (e) => {
      const q = e.target.closest('[data-mf-qty]');
      if (q) { const i = $('[data-mf-qty-input]'); i.value = Math.max(1, (+i.value || 1) + +q.dataset.mfQty); }
      if (e.target.closest('[data-mf-sticky-atc]') && form) {
        form.requestSubmit ? form.requestSubmit(atc) : atc.click();
      }
    });

    // Sticky add to cart
    const sticky = $('[data-mf-sticky]');
    const buy = $('[data-mf-buy]');
    if (sticky && buy && 'IntersectionObserver' in window) {
      new IntersectionObserver(([en]) => {
        const show = !en.isIntersecting && en.boundingClientRect.top < 0;
        sticky.classList.toggle('mf-is-visible', show);
        sticky.setAttribute('aria-hidden', String(!show));
        if (stickyBtn) stickyBtn.tabIndex = show ? 0 : -1;
        doc.body.classList.toggle('mf-has-sticky-atc', show);
      }).observe(buy);
    }

    // Mobile gallery dots
    const track = $('[data-mf-mtrack]');
    if (track) track.addEventListener('scroll', () => {
      const i = Math.round(track.scrollLeft / track.clientWidth);
      $$('.mf-dots i').forEach((d, k) => d.classList.toggle('mf-on', k === i));
    }, { passive: true });

    // Lightbox
    const lb = $('[data-mf-lightbox]');
    const slides = $$('[data-mf-gallery] [data-mf-zoom][data-full]').map((b) => ({ src: b.dataset.full, alt: b.dataset.alt }));
    let li = 0;
    const show = (i) => {
      if (!slides.length) return;
      li = (i + slides.length) % slides.length;
      const img = lb.querySelector('[data-mf-lb-img]');
      img.src = slides[li].src; img.alt = slides[li].alt; img.classList.remove('mf-is-zoomed');
      lb.querySelector('[data-mf-lb-count]').textContent = `${li + 1} / ${slides.length}`;
    };
    let lastFocus;
    const openLb = (i) => { lastFocus = doc.activeElement; show(i); lb.classList.add('mf-is-open'); doc.body.classList.add('overflow-hidden'); lb.querySelector('[data-mf-lightbox-close]').focus(); };
    const closeLb = () => { lb.classList.remove('mf-is-open'); doc.body.classList.remove('overflow-hidden'); lastFocus?.focus(); };
    if (lb) {
      doc.body.appendChild(lb); // escape transformed ancestors
      root.addEventListener('click', (e) => { const z = e.target.closest('[data-mf-zoom]'); if (z) openLb(+z.dataset.mfZoom); });
      lb.addEventListener('click', (e) => {
        if (e.target.closest('[data-mf-lightbox-close]')) return closeLb();
        const n = e.target.closest('[data-mf-lb]'); if (n) return show(li + +n.dataset.mfLb);
        if (e.target.matches('[data-mf-lb-img]')) e.target.classList.toggle('mf-is-zoomed');
      });
      doc.addEventListener('keydown', (e) => {
        if (!lb.classList.contains('mf-is-open')) return;
        if (e.key === 'Escape') closeLb();
        if (e.key === 'ArrowRight') show(li + 1);
        if (e.key === 'ArrowLeft') show(li - 1);
      });
    }
  }

  const boot = (scope = doc) => scope.querySelectorAll('[data-mf-product]').forEach(init);
  window.MFProduct = { init: boot, formatMoney };
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', () => boot()); else boot();
  doc.addEventListener('shopify:section:load', (e) => boot(e.target));
})();
