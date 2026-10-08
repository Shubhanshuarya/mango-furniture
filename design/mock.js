/* ==========================================================================
   Mango mockups — shared shell + interactions (vanilla, no build step).
   Each render function below is the prototype for a Stage B snippet:
     shellTop()     → sections/announcement-bar, sections/header, header-mega-menu, menu-drawer
     shellBottom()  → sections/footer, cart-drawer, predictive-search, whatsapp-button
     card()         → snippets/card-product.liquid
     quickView()    → snippets/quick-view.liquid
   Review states: ?state=<name> or postMessage {type:'mf:state', state} from index.html.
   ========================================================================== */
(() => {
  const root = document.documentElement;
  root.classList.remove('no-js');
  const P = window.MF_PRODUCTS || [];
  const byHandle = Object.fromEntries(P.map((p) => [p.handle, p]));
  const params = new URLSearchParams(location.search);
  const BASE = window.MF_BASE ?? '../'; // design/components.html sets ''
  const FREE_SHIP_THRESHOLD = 0; // Live shipping policy: free shipping on all products. Set a $ value to show the progress bar instead.
  const page = document.body.dataset.page || '';

  if (params.get('theme') === 'dark') root.dataset.theme = 'dark';

  const money = (n) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const icon = (id, size) => `<svg ${size ? `width="${size}" height="${size}"` : ''} aria-hidden="true"><use href="#i-${id}"/></svg>`;

  /* ---------- Icon sprite ---------- */
  const sprite = `
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="i-search" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></symbol>
  <symbol id="i-user" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></symbol>
  <symbol id="i-bag" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 8h14l-1 13H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></symbol>
  <symbol id="i-menu" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 7h18M3 12h18M3 17h12"/></symbol>
  <symbol id="i-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 6l12 12M18 6 6 18"/></symbol>
  <symbol id="i-down" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m6 9 6 6 6-6"/></symbol>
  <symbol id="i-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6"/></symbol>
  <symbol id="i-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M15 6l-6 6 6 6"/></symbol>
  <symbol id="i-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m9 6 6 6-6 6"/></symbol>
  <symbol id="i-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m5 12 4.5 4.5L19 7"/></symbol>
  <symbol id="i-alert" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5v.01"/></symbol>
  <symbol id="i-filter" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/></symbol>
  <symbol id="i-truck" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></symbol>
  <symbol id="i-hand" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12M11 11V4.5a1.5 1.5 0 0 1 3 0V12M14 11V6a1.5 1.5 0 0 1 3 0v8a6 6 0 0 1-6 6h-1a6 6 0 0 1-5-2.7L3 14.5a1.6 1.6 0 0 1 2.6-1.8L8 15"/></symbol>
  <symbol id="i-ruler" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m3 16 13-13 5 5L8 21z"/><path d="m7 12 2 2M10 9l2 2M13 6l2 2"/></symbol>
  <symbol id="i-chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 5h16v11H9l-5 4z"/></symbol>
  <symbol id="i-tag" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.3"/></symbol>
  <symbol id="i-leaf" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 19C5 10 10 5 20 4c0 10-5 15-14 15zM5 19l8-8"/></symbol>
  <symbol id="i-cube" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/></symbol>
  <symbol id="i-play" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></symbol>
  <symbol id="i-zoom" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M11 8v6M8 11h6"/></symbol>
  <symbol id="i-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></symbol>
  <symbol id="i-mail" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></symbol>
  <symbol id="i-phone" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"/></symbol>
  <symbol id="i-pin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></symbol>
  <symbol id="i-ig" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/></symbol>
  <symbol id="i-wa" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.8-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2l-.4-.2Z"/></symbol>
</svg>`;

  /* ---------- Navigation model (Stage B: from Admin → Navigation "main-menu") ---------- */
  const NAV = {
    shop: [
      { title: 'Living Room', links: [['Coffee Tables', 'coffee-table'], ['Side Tables', 'side-table'], ['Console Tables', 'console'], ['Accent Chairs', 'accent-chair'], ['Benches & Ottomans', 'bench']] },
      { title: 'Dining & Kitchen', links: [['Counter Stools', 'counter-stool-chair'], ['Dining Chairs', 'dining-chair'], ['Counter Tables', 'counter-table']] },
      { title: 'Storage & Office', links: [['Cabinets & Sideboards', 'storage-organization'], ['Bookcases', 'bookcase'], ['Study Desks', 'study-desk']], soon: 'Bedroom: coming soon' },
      { title: 'Accessories', links: [['Trays & Bowls', 'accessories'], ['Table Linen', 'accessories'], ['Serving Boards', 'accessories'], ['Décor', 'accessories']] },
    ],
    primary: [['Design Services', 'design-services.html'], ['Trade Program', 'trade-program.html'], ['About', 'about.html'], ['Contact', 'contact.html']],
  };
  const href = (p) => BASE + 'pages/' + p;

  function shellTop() {
    const megaCols = NAV.shop.map((c) => `
      <div><h3>${c.title}</h3><ul>${c.links.map(([t]) => `<li><a href="${href('collection.html')}">${t}</a></li>`).join('')}</ul>
      ${c.soon ? `<p class="soon">${c.soon}</p>` : ''}</div>`).join('');
    return `
<a class="skip-link" href="#main">Skip to content</a>
<div class="announcement" role="region" aria-label="Announcement">
  Free shipping across the US<span class="hide-mobile"> <span aria-hidden="true">·</span> Handcrafted in solid mango wood</span>
</div>
<header class="site-header" id="site-header">
  <div class="container header-inner">
    <button class="icon-btn header-menu-btn" aria-label="Open menu" aria-controls="menu-drawer" aria-expanded="false" data-open="menu-drawer">${icon('menu')}</button>
    <nav class="header-nav" aria-label="Primary">
      <ul>
        <li><button class="nav-trigger" aria-expanded="false" aria-controls="mega-shop">Shop ${icon('down')}</button></li>
        ${NAV.primary.map(([t, u]) => `<li><a href="${href(u)}" ${location.pathname.endsWith(u) ? 'aria-current="page"' : ''}>${t}</a></li>`).join('')}
      </ul>
    </nav>
    <a class="logo" href="${href('home.html')}" aria-label="Mango Furniture Inc, home">Mango<small>Furniture Inc</small></a>
    <div class="header-actions">
      <a class="icon-btn hide-mobile" href="#" data-wa aria-label="Chat with us on WhatsApp">${icon('wa')}</a>
      <button class="icon-btn" aria-label="Search" aria-controls="search-panel" data-open="search-panel">${icon('search')}</button>
      <a class="icon-btn hide-mobile" href="${href('account-login.html')}" aria-label="Account">${icon('user')}</a>
      <button class="icon-btn" aria-label="Cart" aria-controls="cart-drawer" data-open="cart-drawer">${icon('bag')}<span class="count-bubble" data-cart-count hidden>0</span></button>
    </div>
  </div>
  <div class="mega" id="mega-shop" role="region" aria-label="Shop menu">
    <div class="container mega-inner">
      ${megaCols}
      <div class="mega-feature">
        <a href="${href('product.html')}"><span class="media"><img src="${BASE}assets/products/annabel-bench-1.webp" alt="" loading="lazy"></span>Annabel Bench<small>Solid mango wood and leather</small></a>
        <a href="${href('design-services.html')}"><span class="media"><img src="${BASE}assets/askara/ds-travertine-table.webp" alt="" loading="lazy"></span>Design Services<small>Custom pieces, 3D renderings</small></a>
      </div>
      <div class="mega-all"><span>Every piece is made by hand in our Jodhpur workshop.</span><a class="link-arrow" href="${href('collection.html')}">Shop all furniture ${icon('arrow', 16)}</a></div>
    </div>
  </div>
</header>

<aside class="drawer drawer--left" id="menu-drawer" aria-label="Menu" aria-modal="true" role="dialog" tabindex="-1">
  <div class="drawer-head"><a class="logo" href="${href('home.html')}" style="justify-self:start">Mango<small>Furniture Inc</small></a><button class="icon-btn" data-close aria-label="Close menu">${icon('close')}</button></div>
  <div class="drawer-body mnav">
    <div class="mnav-tiles">
      ${[['Chairs', 'askara/cat-accent-chairs'], ['Coffee tables', 'askara/cat-coffee-tables'], ['Side tables', 'askara/cat-side-tables'], ['Benches', 'askara/cat-benches'], ['Consoles', 'askara/cat-console-shelving'], ['Dining', 'askara/cat-dining']]
        .map(([t, i]) => `<a href="${href('collection.html')}"><span class="media"><img src="${BASE}assets/${i}.webp" alt="" loading="lazy"></span>${t}</a>`).join('')}
    </div>
    <ul class="mnav-list">
      ${NAV.shop.map((c) => `<li><details><summary>${c.title} ${icon('down')}</summary><ul>${c.links.map(([t]) => `<li><a href="${href('collection.html')}">${t}</a></li>`).join('')}${c.soon ? `<li class="muted" style="padding:8px 0;font-size:13px">${c.soon}</li>` : ''}</ul></details></li>`).join('')}
      ${NAV.primary.map(([t, u]) => `<li><a href="${href(u)}">${t} ${icon('arrow', 18)}</a></li>`).join('')}
    </ul>
    <div class="mnav-secondary">
      <a href="${href('account-login.html')}">${icon('user')} Sign in / Create account</a>
      <a href="tel:+15307510933">${icon('phone')} 530-751-0933</a>
      <a href="#" data-wa>${icon('wa')} WhatsApp us <span class="placeholder-flag">number</span></a>
      <a href="${href('faq.html')}">${icon('chat')} Help &amp; FAQ</a>
    </div>
  </div>
</aside>`;
  }

  function shellBottom() {
    return `
<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div>
        <p class="display display-m" style="color:inherit;max-width:18ch">Home-décor inspiration and first looks at new arrivals.</p>
        <form class="newsletter" data-newsletter novalidate>
          <label class="visually-hidden" for="nl-email">Email address</label>
          <input id="nl-email" type="email" name="contact[email]" placeholder="Email address" autocomplete="email" required>
          <button class="btn" type="submit">Sign up</button>
        </form>
        <p class="footer-note" data-nl-status role="status" style="font-size:13px;margin:10px 0 0;opacity:.8"></p>
      </div>
      <div><h4>Support</h4><ul>
        <li><a href="${href('policy.html')}">Shipping &amp; Delivery</a></li><li><a href="${href('policy.html')}">Returns &amp; Exchanges</a></li>
        <li><a href="${href('faq.html')}">FAQ</a></li><li><a href="${href('policy.html')}">Billing &amp; Payment</a></li><li><a href="${href('contact.html')}">Contact us</a></li></ul></div>
      <div><h4>Company</h4><ul>
        <li><a href="${href('about.html')}">About</a></li><li><a href="${href('design-services.html')}">Design Services</a></li>
        <li><a href="${href('trade-program.html')}">Trade Program</a></li><li><a href="${href('about.html')}#responsibility">Corporate Responsibility</a></li><li><a href="${href('blog.html')}">Journal</a></li></ul></div>
      <div><h4>Connect</h4><ul>
        <li><a href="https://www.instagram.com/mangofurnitureinc/" rel="noopener">Instagram</a></li><li><a href="mailto:info@mangofurnitureinc.com">info@mangofurnitureinc.com</a></li><li><a href="tel:+15307510933">530-751-0933</a></li>
        <li><a href="${href('policy.html')}">Privacy Policy</a></li><li><a href="${href('policy.html')}">Terms of Service</a></li></ul></div>
    </div>
    <div class="footer-base">
      <span>© 2026 Mango Furniture Inc · 919 Garden Hwy, Yuba City, CA 95991 · <a href="${href('policy.html')}">Privacy</a> · <a href="${href('policy.html')}">Terms</a></span>
      <span>Visa · Mastercard · Amex · Discover · Shop Pay</span>
    </div>
  </div>
</footer>

<aside class="drawer drawer--right" id="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title" tabindex="-1">
  <div class="drawer-head"><h2 id="cart-title">Your cart <span class="muted tabular" data-cart-count-text></span></h2><button class="icon-btn" data-close aria-label="Close cart">${icon('close')}</button></div>
  <div class="drawer-body" data-cart-body></div>
  <div class="drawer-foot" data-cart-foot></div>
</aside>

<div class="search-panel" id="search-panel" role="dialog" aria-modal="true" aria-label="Search" tabindex="-1">
  <div class="container">
    <form class="search-bar" action="${href('search.html')}" role="search">
      ${icon('search')}
      <label class="visually-hidden" for="ps-input">Search</label>
      <input id="ps-input" name="q" type="search" placeholder="Search coffee tables, benches…" autocomplete="off" aria-controls="ps-results">
      <button class="icon-btn" type="button" data-close aria-label="Close search">${icon('close')}</button>
    </form>
    <div id="ps-results" aria-live="polite"></div>
  </div>
</div>

<div class="modal" id="quickview" role="dialog" aria-modal="true" aria-label="Quick view" tabindex="-1"><div class="modal-panel"><button class="icon-btn modal-close" data-close aria-label="Close">${icon('close')}</button><div data-qv></div></div></div>
<div class="scrim" data-scrim></div>
<div class="toast-region" aria-live="polite" data-toasts></div>
<a class="wa-fab" href="#" data-wa aria-label="Chat with us on WhatsApp">${icon('wa')}</a>`;
  }

  /* ---------- Product card (snippets/card-product.liquid) ---------- */
  function card(p, { i = 0, soldOut = false, eager = false } = {}) {
    const save = p.compare ? Math.round(p.compare - p.price) : 0;
    const sw = p.options.find((o) => o.values.some((v) => v.color));
    const lazy = eager ? '' : 'loading="lazy"';
    return `
<article class="card reveal${soldOut ? ' is-soldout' : ''}" style="--i:${i % 4}">
  <div class="card-media">
    <div class="card-badges">${soldOut ? '<span class="badge badge--soldout">Sold out</span>' : save ? `<span class="badge badge--sale">Save ${money(save)}</span>` : ''}</div>
    <img src="${BASE}${p.images[0]}" alt="${esc(p.title)}" width="1000" height="1250" ${lazy}>
    ${p.images[1] ? `<img src="${BASE}${p.images[1]}" alt="" width="1000" height="1250" loading="lazy">` : ''}
    ${soldOut ? `<button class="card-quick" type="button" data-notify="${p.handle}">Notify me</button>` : `<button class="card-quick" type="button" data-quick="${p.handle}" aria-label="Quick add ${esc(p.title)}">Quick add</button>`}
  </div>
  <h3 class="card-title"><a href="${href('product.html')}">${esc(p.title)}</a></h3>
  <div class="card-meta">
    <span class="price">${soldOut ? `<span class="muted">${money(p.price)}</span>` : `<span>${money(p.price)}</span>${p.compare ? `<s>${money(p.compare)}</s>` : ''}`}</span>
    ${sw ? `<ul class="swatches" aria-label="${sw.values.length} colours">${sw.values.map((v, k) => `<li class="swatch" style="--sw:${v.color || '#ccc'}" ${k === 0 ? 'aria-current="true"' : ''} title="${esc(v.label)}"></li>`).join('')}</ul>` : `<span class="card-material">${esc(p.material)}</span>`}
  </div>
  ${p.dims ? `<div class="dim">${p.dims}</div>` : ''}
</article>`;
  }
  const skeletonCard = () => `<div class="card card--skeleton" aria-hidden="true"><div class="card-media skeleton"></div><div class="skeleton sk-line"></div><div class="skeleton sk-line short"></div></div>`;

  /* ---------- Cart state (Stage B: /cart.js + Section Rendering API) ---------- */
  const store = {
    get() { try { return JSON.parse(sessionStorage.getItem('mf-cart')); } catch { return null; } },
    set(v) { try { sessionStorage.setItem('mf-cart', JSON.stringify(v)); } catch {} },
  };
  let cart = store.get() || [
    { handle: 'annabel-bench', variant: 'Dark Brown', qty: 1 },
    { handle: 'landon-mango-wood-and-boucle-fabric-accent-chair', variant: null, qty: 1 },
  ];
  if (params.get('state') === 'cart-empty') cart = [];
  const cartTotal = () => cart.reduce((s, l) => s + byHandle[l.handle].price * l.qty, 0);
  const cartCount = () => cart.reduce((s, l) => s + l.qty, 0);

  function shipBar(total) {
    if (!FREE_SHIP_THRESHOLD) return `<div class="ship-bar"><span>${icon('truck', 16)} <b>Free US shipping</b> is included on this order.</span></div>`;
    const left = Math.max(0, FREE_SHIP_THRESHOLD - total);
    const pct = Math.min(100, (total / FREE_SHIP_THRESHOLD) * 100);
    return `<div class="ship-bar"><span>${left ? `You're <b>${money(left)}</b> away from free shipping` : `${icon('check', 14)} <b>You've unlocked free shipping</b>`} <span class="placeholder-flag">threshold to confirm</span></span>
      <div class="track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(pct)}" aria-label="Progress to free shipping"><div class="fill" style="width:${pct}%"></div></div></div>`;
  }
  function lineHtml(l) {
    const p = byHandle[l.handle];
    return `<div class="line" data-line="${l.handle}">
      <a class="line-media" href="${href('product.html')}"><img src="${BASE}${p.images[0]}" alt="" loading="lazy"></a>
      <div><h3><a href="${href('product.html')}">${esc(p.title)}</a></h3>
        <p class="meta">${l.variant ? esc(l.variant) + ' · ' : ''}${esc(p.material)}</p>
        <div class="line-actions">
          <div class="qty qty--sm"><button type="button" data-qty="-1" aria-label="Decrease quantity">−</button><input type="number" value="${l.qty}" min="0" aria-label="Quantity" readonly><button type="button" data-qty="1" aria-label="Increase quantity">+</button></div>
          <button class="remove" type="button" data-remove>Remove</button>
        </div></div>
      <div class="price"><span>${money(p.price * l.qty)}</span>${p.compare ? `<s>${money(p.compare * l.qty)}</s>` : ''}</div>
    </div>`;
  }
  const upsellHandles = ['tracy-multipurpose-hand-carved-genuine-marble-tray', 'rocco-side-table-1', 'olwen-side-table'];
  function renderCart() {
    const n = cartCount();
    $$('[data-cart-count]').forEach((b) => { b.textContent = n; b.hidden = !n; });
    $$('[data-cart-count-text]').forEach((b) => (b.textContent = n ? `(${n})` : ''));
    const body = $('[data-cart-body]'), foot = $('[data-cart-foot]');
    if (!body) return;
    if (!cart.length) {
      body.innerHTML = `<div class="empty-state"><span class="icon-circle">${icon('bag')}</span><h3 class="display display-s">Your cart is empty</h3><p class="muted" style="margin:0">Start with a piece you'll keep for decades.</p><a class="btn" href="${href('collection.html')}">Shop furniture</a></div>
        <div class="upsell"><h3>Popular right now</h3>${['annabel-bench', 'jorf-side-table', 'landon-mango-wood-and-boucle-fabric-accent-chair'].map(upsellRow).join('')}</div>`;
      foot.hidden = true;
    } else {
      const ups = upsellHandles.filter((h) => !cart.some((l) => l.handle === h)).slice(0, 2);
      body.innerHTML = shipBar(cartTotal()) + cart.map(lineHtml).join('') + (ups.length ? `<div class="upsell"><h3>Complete the room</h3>${ups.map(upsellRow).join('')}</div>` : '');
      foot.hidden = false;
      foot.innerHTML = `<div class="totals"><div class="grand"><span>Subtotal</span><span class="tabular">${money(cartTotal())}</span></div></div>
        <p class="installments" style="margin:0">Taxes and shipping calculated at checkout. Pay over time with <b>Shop Pay Installments</b>.</p>
        <a class="btn btn--accent btn--block" href="#">${icon('lock', 16)} Checkout</a>
        <a class="btn btn--secondary btn--block" href="${href('cart.html')}">View cart</a>`;
    }
    store.set(cart);
    document.dispatchEvent(new CustomEvent('mf:cart', { detail: cart }));
  }
  function upsellRow(h) {
    const p = byHandle[h];
    return `<div class="upsell-row"><img src="${BASE}${p.images[0]}" alt="" loading="lazy"><div><b>${esc(p.title)}</b><span>${money(p.price)}</span></div><button class="btn btn--secondary btn--sm" type="button" data-add="${h}">Add</button></div>`;
  }
  function addToCart(handle, variant = null, qty = 1, btn) {
    const go = () => {
      const ex = cart.find((l) => l.handle === handle && l.variant === variant);
      ex ? (ex.qty += qty) : cart.push({ handle, variant, qty });
      renderCart();
      if (btn) { btn.classList.remove('is-loading'); const t = btn.innerHTML; btn.innerHTML = `${icon('check', 18)} Added`; setTimeout(() => (btn.innerHTML = t), 1600); }
      close('quickview'); open('cart-drawer');
    };
    if (btn) { btn.classList.add('is-loading'); setTimeout(go, 550); } else go();
  }
  function toast(html) {
    const r = $('[data-toasts]'); if (!r) return;
    const t = document.createElement('div'); t.className = 'toast'; t.innerHTML = html; r.append(t);
    setTimeout(() => t.remove(), 4200);
  }

  /* ---------- Quick view ---------- */
  function quickView(h) {
    const p = byHandle[h];
    const sw = p.options[0];
    $('[data-qv]').innerHTML = `<div class="quickview">
      <div class="qv-media"><img src="${BASE}${p.images[0]}" alt="${esc(p.title)}"></div>
      <div class="qv-body">
        <p class="eyebrow" style="margin:0">${esc(p.category)}</p>
        <h2 class="display display-m">${esc(p.title)}</h2>
        <div class="price" style="font-size:var(--step-1)"><span>${money(p.price)}</span>${p.compare ? `<s>${money(p.compare)}</s><span class="save">Save ${money(p.compare - p.price)}</span>` : ''}</div>
        ${p.dims ? `<p class="dim" style="margin:0">${p.dims}</p>` : ''}
        ${sw ? `<fieldset class="option"><legend>${esc(sw.name)}: <span data-qv-val>${esc(sw.values[0].label)}</span></legend>${sw.values.some((v) => v.color)
          ? `<div class="swatch-btns">${sw.values.map((v, k) => `<label class="swatch-btn" title="${esc(v.label)}"><input type="radio" name="qv-opt" value="${esc(v.label)}" ${k ? '' : 'checked'}><span style="--sw:${v.color || '#ccc'}"></span><span class="visually-hidden">${esc(v.label)}</span></label>`).join('')}</div>`
          : `<div class="pills">${sw.values.map((v, k) => `<label class="pill"><input type="radio" name="qv-opt" value="${esc(v.label)}" ${k ? '' : 'checked'}><span>${esc(v.label)}</span></label>`).join('')}</div>`}</fieldset>` : ''}
        <button class="btn btn--accent btn--block" type="button" data-qv-add="${h}">Add to cart · ${money(p.price)}</button>
        <a class="link-arrow" href="${href('product.html')}" style="justify-self:start">View full details ${icon('arrow', 16)}</a>
      </div></div>`;
    open('quickview');
  }

  /* ---------- Open / close layers ---------- */
  let lastFocus = null;
  const layers = ['menu-drawer', 'cart-drawer', 'search-panel', 'quickview', 'filter-drawer', 'lightbox'];
  function open(id) {
    const el = document.getElementById(id); if (!el) return;
    layers.forEach((l) => l !== id && close(l, true));
    closeMega();
    lastFocus = document.activeElement;
    el.classList.add('is-open'); $('[data-scrim]')?.classList.add('is-open'); document.body.classList.add('is-locked');
    $$(`[aria-controls="${id}"]`).forEach((b) => b.setAttribute('aria-expanded', 'true'));
    $('.wa-fab')?.classList.add('is-hidden');
    setTimeout(() => (el.querySelector('input:not([type=hidden]), button, a') || el).focus({ preventScroll: true }), 60);
    if (id === 'search-panel') renderSearch('');
  }
  function close(id, silent) {
    const el = document.getElementById(id); if (!el || !el.classList.contains('is-open')) return;
    el.classList.remove('is-open');
    $$(`[aria-controls="${id}"]`).forEach((b) => b.setAttribute('aria-expanded', 'false'));
    if (!layers.some((l) => document.getElementById(l)?.classList.contains('is-open'))) {
      $('[data-scrim]')?.classList.remove('is-open'); document.body.classList.remove('is-locked');
      if (!document.querySelector('.sticky-atc.is-visible')) $('.wa-fab')?.classList.remove('is-hidden');
    }
    if (!silent && lastFocus) lastFocus.focus({ preventScroll: true });
  }
  const closeAll = () => layers.forEach((l) => close(l));

  /* ---------- Mega menu ---------- */
  let megaTimer;
  function openMega() { clearTimeout(megaTimer); $('#mega-shop')?.classList.add('is-open'); $('.nav-trigger')?.setAttribute('aria-expanded', 'true'); }
  function closeMega() { $('#mega-shop')?.classList.remove('is-open'); $('.nav-trigger')?.setAttribute('aria-expanded', 'false'); }

  /* ---------- Predictive search ---------- */
  function renderSearch(q) {
    const box = $('#ps-results'); if (!box) return;
    const term = q.trim().toLowerCase();
    if (term === '__empty__' || (term && !P.some((p) => (p.title + p.category + p.material).toLowerCase().includes(term)))) {
      box.innerHTML = `<div class="empty-state"><span class="icon-circle">${icon('search')}</span><h3 class="display display-s">No results for “${esc(term === '__empty__' ? 'teak sofa' : q)}”</h3>
        <p class="muted" style="margin:0">Check the spelling, or try a broader term like “table” or “chair”.</p>
        <div class="chips">${['Coffee tables', 'Benches', 'Accent chairs', 'Side tables'].map((t) => `<a class="chip" href="${href('collection.html')}">${t}</a>`).join('')}</div></div>`;
      return;
    }
    const hits = (term ? P.filter((p) => (p.title + p.category + p.material).toLowerCase().includes(term)) : P.filter((p) => ['annabel-bench', 'landon-mango-wood-and-boucle-fabric-accent-chair', 'osiac-solid-wood-console-table', 'jorf-side-table'].includes(p.handle))).slice(0, 4);
    const sugg = term ? [...new Set(P.map((p) => p.category).filter((c) => c.toLowerCase().includes(term)).concat(hits.map((h) => h.title)))].slice(0, 5)
      : ['Coffee tables', 'Accent chairs', 'Benches', 'Console tables', 'Leather'];
    const hl = (s) => term ? esc(s).replace(new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig'), '<mark>$1</mark>') : esc(s);
    box.innerHTML = `<div class="search-results">
      <div><h3>${term ? 'Suggestions' : 'Popular searches'}</h3><ul class="suggest">${sugg.map((s) => `<li><a href="${href('search.html')}">${hl(s)}</a></li>`).join('')}</ul>
        <h3 style="margin-top:var(--space-l)">Help</h3><ul class="suggest"><li><a href="${href('faq.html')}">Shipping &amp; delivery</a></li><li><a href="${href('design-services.html')}">Custom sizes</a></li></ul></div>
      <div><h3>${term ? 'Products' : 'Bestsellers'} <span class="placeholder-flag">verify</span></h3><div class="search-cards">${hits.map((p, i) => card(p, { i })).join('')}</div>
        ${term ? `<p style="margin-top:var(--space-m)"><a class="link-arrow" href="${href('search.html')}">See all results for “${esc(q)}” ${icon('arrow', 16)}</a></p>` : ''}</div></div>`;
    $$('.reveal', box).forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- Mount ---------- */
  document.body.insertAdjacentHTML('afterbegin', sprite + shellTop());
  document.body.insertAdjacentHTML('beforeend', shellBottom());
  $$('[data-cards]').forEach((el) => {
    const handles = el.dataset.cards.split(',').map((s) => s.trim());
    const soldOut = (el.dataset.soldout || '').split(',');
    el.innerHTML = handles.map((h, i) => byHandle[h] && card(byHandle[h], { i, soldOut: soldOut.includes(h) })).join('');
  });
  renderCart();

  /* ---------- Events ---------- */
  document.addEventListener('click', (e) => {
    const t = e.target;
    const o = t.closest('[data-open]'); if (o) { e.preventDefault(); open(o.dataset.open); return; }
    if (t.closest('[data-close]') || t.closest('[data-scrim]')) { closeAll(); return; }
    const q = t.closest('[data-quick]'); if (q) { e.preventDefault(); const p = byHandle[q.dataset.quick]; p.options.length ? quickView(p.handle) : addToCart(p.handle, null, 1, q); return; }
    const qa = t.closest('[data-qv-add]'); if (qa) { addToCart(qa.dataset.qvAdd, $('input[name=qv-opt]:checked')?.value || null, 1, qa); return; }
    const ad = t.closest('[data-add]'); if (ad) { addToCart(ad.dataset.add, byHandle[ad.dataset.add].options[0]?.values[0].label || null, 1, ad); return; }
    const nt = t.closest('[data-notify]'); if (nt) { toast(`${icon('mail', 18)} We'll email you when ${esc(byHandle[nt.dataset.notify].title)} is back.`); return; }
    const qb = t.closest('[data-qty]');
    if (qb) { const h = qb.closest('[data-line]').dataset.line; const l = cart.find((x) => x.handle === h); l.qty += +qb.dataset.qty; if (l.qty <= 0) cart = cart.filter((x) => x !== l); renderCart(); return; }
    const rm = t.closest('[data-remove]');
    if (rm) { const row = rm.closest('[data-line]'); row.classList.add('is-removing'); setTimeout(() => { cart = cart.filter((x) => x.handle !== row.dataset.line); renderCart(); }, 220); return; }
    if (t.closest('[data-wa]')) { e.preventDefault(); toast(`${icon('wa', 18)} Opens WhatsApp chat (US number to confirm)`); return; }
    if (t.closest('.nav-trigger')) { $('#mega-shop').classList.contains('is-open') ? closeMega() : openMega(); return; }
    if (!t.closest('.mega')) closeMega();
  });
  document.addEventListener('change', (e) => { if (e.target.name === 'qv-opt') { const v = $('[data-qv-val]'); if (v) v.textContent = e.target.value; } });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeAll(); closeMega(); } });
  const trig = $('.nav-trigger'), mega = $('#mega-shop');
  if (trig && matchMedia('(hover: hover)').matches) {
    [trig, mega].forEach((el) => { el.addEventListener('mouseenter', openMega); el.addEventListener('mouseleave', () => (megaTimer = setTimeout(closeMega, 180))); });
  }
  $('#ps-input')?.addEventListener('input', (e) => renderSearch(e.target.value));
  $('[data-newsletter]')?.addEventListener('submit', (e) => {
    e.preventDefault(); const i = e.target.querySelector('input'); const s = $('[data-nl-status]');
    if (!i.checkValidity()) { s.textContent = 'Please enter a valid email address.'; i.setAttribute('aria-invalid', 'true'); i.focus(); return; }
    i.removeAttribute('aria-invalid'); s.textContent = 'Thanks for subscribing. Look out for our next edit.'; e.target.reset();
  });

  /* ---------- Form validation (Stage B: native {% form %} + same client checks) ---------- */
  function fieldValid(input) {
    if (input.type === 'checkbox' && input.required) return input.checked;
    if (input.type === 'radio') return !input.required || !!document.querySelector(`input[name="${input.name}"]:checked`);
    return input.checkValidity() && (!input.required || input.value.trim() !== '');
  }
  function validate(form, { showSummary = true } = {}) {
    const bad = [];
    $$('input, select, textarea', form).forEach((input) => {
      const f = input.closest('.field'); if (!f || input.type === 'hidden') return;
      const ok = fieldValid(input);
      if (!ok && !bad.some((b) => b.f === f)) bad.push({ f, input });
    });
    $$('.field', form).forEach((f) => {
      const isBad = bad.some((b) => b.f === f);
      f.classList.toggle('has-error', isBad);
      $$('input, select, textarea', f).forEach((i) => (isBad ? i.setAttribute('aria-invalid', 'true') : i.removeAttribute('aria-invalid')));
    });
    const sum = $('.form-status--error', form), ok = $('.form-status--success', form);
    ok?.classList.remove('is-visible');
    if (sum) {
      sum.classList.toggle('is-visible', bad.length > 0 && showSummary);
      const t = $('[data-error-count]', sum); if (t) t.textContent = bad.length === 1 ? '1 field needs attention.' : `${bad.length} fields need attention.`;
    }
    return bad;
  }
  function succeed(form) {
    const btn = $('[type=submit]', form); btn?.classList.add('is-loading');
    setTimeout(() => {
      btn?.classList.remove('is-loading');
      $('.form-status--error', form)?.classList.remove('is-visible');
      const ok = $('.form-status--success', form); ok?.classList.add('is-visible');
      form.reset(); ok?.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); ok?.focus?.();
    }, 900);
  }
  $$('form[data-validate]').forEach((form) => {
    form.setAttribute('novalidate', '');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const bad = validate(form);
      if (bad.length) { bad[0].input.focus(); return; }
      succeed(form);
    });
    form.addEventListener('input', (e) => { const f = e.target.closest('.field.has-error'); if (f && fieldValid(e.target)) { f.classList.remove('has-error'); e.target.removeAttribute('aria-invalid'); } });
    form.addEventListener('focusout', (e) => { const f = e.target.closest('.field'); if (f && e.target.value && !fieldValid(e.target)) f.classList.add('has-error'); });
  });

  /* ---------- Header hide/show, reveals ---------- */
  const header = $('.site-header');
  let lastY = scrollY, ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      const y = scrollY;
      header.classList.toggle('is-scrolled', y > 8);
      const hide = y > 240 && y > lastY && !$('#mega-shop.is-open');
      header.classList.toggle('is-hidden', hide);
      document.body.classList.toggle('header-hidden', hide);
      lastY = y; ticking = false;
    });
  }, { passive: true });
  const io = 'IntersectionObserver' in window && new IntersectionObserver((ens) => ens.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
  const observe = (scope = document) => $$('.reveal:not(.is-in)', scope).forEach((el) => (io ? io.observe(el) : el.classList.add('is-in')));
  observe();
  if (params.has('shot')) $$('.reveal').forEach((el) => el.classList.add('is-in')); // review screenshots

  /* ---------- Review states ---------- */
  const stateHandlers = {
    'mega-open': () => openMega(),
    'menu-open': () => open('menu-drawer'),
    'cart-open': () => open('cart-drawer'),
    'cart-empty': () => { cart = []; renderCart(); if (page !== 'cart') open('cart-drawer'); },
    'search-open': () => { open('search-panel'); const i = $('#ps-input'); i.value = 'table'; renderSearch('table'); },
    'search-empty': () => { open('search-panel'); const i = $('#ps-input'); i.value = 'teak sofa'; renderSearch('__empty__'); },
    'quickview-open': () => quickView('annabel-bench'),
    'dark': () => (root.dataset.theme = 'dark'),
    'form-error': () => { const f = $('form[data-validate]'); if (!f) return; const bad = validate(f); f.scrollIntoView({ block: 'start' }); bad[0]?.input.focus({ preventScroll: true }); },
    'form-success': () => { const f = $('form[data-validate]'); if (!f) return; const ok = $('.form-status--success', f); ok?.classList.add('is-visible'); f.scrollIntoView({ block: 'start' }); },
  };
  function setState(name) {
    closeAll(); closeMega();
    $('.state-note')?.remove();
    if (!name || name === 'default') return;
    document.dispatchEvent(new CustomEvent('mf:state', { detail: name }));
    (stateHandlers[name] || (() => {}))();
    document.body.insertAdjacentHTML('beforeend', `<div class="state-note">State: ${esc(name)}</div>`);
  }
  addEventListener('message', (e) => { if (e.data?.type === 'mf:state') setState(e.data.state); });

  window.MF = { P, byHandle, card, skeletonCard, money, esc, icon, href, BASE, open, close, addToCart, toast, observe, renderCart, stateHandlers, $, $$, get cart() { return cart; } };
  // Page scripts run after this file and may register handlers; apply the URL state once they have.
  addEventListener('load', () => params.get('state') && setState(params.get('state')));
})();
