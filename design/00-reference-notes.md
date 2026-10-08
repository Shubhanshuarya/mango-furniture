# 00 — Reference notes: Askara → Mango Furniture Inc

Reviewed 2026-10-09. Sources: live askara.in pages (home, collection, product, cart, search, blog, about, gallery/design services, trade program, support pages, policies, login, 404) and the public Shopify JSON endpoints for both stores (`/products.json`, `/collections.json`, `/meta.json`).

---

## 1. The two stores at a glance

| | Askara (reference) | Mango Furniture Inc (this repo) |
|---|---|---|
| Market | India, INR | **USA (Yuba City, CA), USD**, ships to 28 countries |
| Catalogue | 44 products; **37 are Rs. 1,000 placeholders and sold out**; 7 real | **65 products, 64 available**, mostly mango wood |
| Product types | Mostly blank or inconsistent | 59 of 65 blank; only Cabinets, Napkin, Placemat, Bowl and Tray are set |
| Variants | Size (dimensions are used as the variant title), some Colour/Material | Mostly a single "Title" variant, a few "Color" |
| Payments | Cards, UPI | Visa/MC/Amex/Discover/Diners, **Shop Pay Installments** |
| Theme | Dawn-derived | Copenhagen (jQuery, GSAP, ScrollTrigger loaded globally) |
| Current home | Hero → categories → stats → image → design services → service highlights | slideshow, collection-grid, popular-products, grid-banner, brands, product-markers, collection-tabs, countdown, split-screen, FAQ, blog, image-banner |

**Implication:** Askara gives us the **story, the information architecture, and the imagery**. The **product and collection data come from this store**. Collection handles differ (`coffee-table` here vs `coffee-tables` on Askara), so the mega menu has to be built from this store's Navigation and collections, not copied.

---

## 2. Keep: what works on Askara

**Brand and story**
- Tagline: "Because true luxury begins where you live."
- About: family manufacturing unit in **Jodhpur**, **20+ years exporting**, "making quality furniture more accessible", "where East meets West".
- Stats: 100+ Signature Designs · 100% Handcrafted · 500+ Happy Homes. **Verify these for the US store.** "500+ Happy Homes across India" does not transfer as written.
- Materials: solid mango wood, often paired with leather or marble, artisan-made.

**Information architecture**
- Menu: Home · Products (mega) · Design Services · About · Contact, plus WhatsApp, Search, Account and Cart.
- Mega menu grouped **by room**: Living Room, Dining Room, Office, Bedroom, with a "Trending" product column.
- Footer: Support (Shipping, Returns, FAQ, Billing, Trade, Contact) · Company (About, Corporate Responsibility, Blog) · Legal · Connect (Instagram).

**Content blocks worth porting**
- Shop by Category carousel (Side Tables, Coffee Tables, Accent Chairs, Console Tables, Benches), each with a one-line description.
- Design Services: a three-step "How it works" (email → discovery call → 3D renderings and custom pieces), plus three portfolio projects (Atlanta GA, Woodstock GA, Jodhpur). The **two US projects** are strong proof for a US audience.
- Trade Program: benefits, eligibility (designers, architects, commercial owners with company registration), how to apply.
- Corporate Responsibility: five pillars (sustainability, ethical manufacturing, community, environment, transparency).
- Product info pattern: **Dimensions** (product *and* box), **Materials**, **Care & Maintenance**. Good bones for a product-page accordion.
- Blog: about 10 living-room styling articles. Reuse the topics; the store will need its own posts.

---

## 3. Improve: Askara problems and how this redesign handles each

| # | Askara issue (verified) | Fix in this store |
|---|---|---|
| 1 | Hero has no button or primary action | Hero with one primary CTA ("Shop the collection") and one secondary ("Design services") |
| 2 | Contact nav link points to `askaraindia.myshopify.com`; footer "Contact Us" points to a `shopify.com/…/account/settings` URL | Every link is relative or comes from Navigation; QA script flags `myshopify.com` and `shopify.com/` in links |
| 3 | "Terms and Condition" links to the privacy policy | Map each policy correctly: `/policies/terms-of-service`, `/policies/refund-policy`, etc. |
| 4 | **37 of 44 products** show Rs. 1,000 and are sold out; sold-out items are featured as "Trending" | Featured and Trending blocks exclude unavailable products; sold-out gets a clear badge plus "Notify me" placeholder |
| 5 | Malformed dimension `"Wx "L x "H` on Abel Bench; variant dimension differs from description on Leah (26"W x 29"L x 34"H vs 26.5"W x 28"L x 33"H) | Dimensions come from one metafield source; the card hides the line when it's empty |
| 6 | `<meta name="theme-color" content="">` | Set it from the colour token |
| 7 | **Refund policy contradicts the site**: it says "30-day return" with `roolymedia@gmail.com` and `[INSERT RETURN ADDRESS]`, while the Returns page says exchange-only | Policy pages render whatever is in Shopify Admin. **I will not write policy text.** Flagged in `placeholders-to-fill.md` |
| 8 | Terms of Service contains a literal `[LINK]` | Same as above: flag only |
| 9 | Footer "Order FAQ" → `/pages/faqs` returns **404** | Build a real FAQ template (accordion with FAQPage schema) |
| 10 | Product page shows third-party copy "Lone Fox × Joon Loloi…" (template leftover) and "Earn 0 points on this purchase" | Not copied. Loyalty line only renders when an app supplies points |
| 11 | Footer credit "Designed By Rooly Media" | Not copied |
| 12 | Duplicate products (3× Chantell, 2× Sid, 2× Mitzi) and duplicate blog cards; three near-empty blogs (`living-room`, `-1`, `-2`) | Not reused. Mockups use one blog, `news` |
| 13 | Hero and full-width images have **no alt text** | Every image gets alt text in `images-manifest.csv` |
| 14 | Generic cards, no swatches, quick view, hover image or sticky mobile ATC; service blocks are text only | Covered by the page upgrades in the brief |
| 15 | Typo "atlanta, geogia" | Fixed in copy ("Atlanta, Georgia") |
| 16 | Cart page shows account nav (Profile/Addresses/Logout) above an empty cart | Dedicated cart layout: empty state, then featured products |

**Policy facts that do NOT transfer:** Askara's shipping page ("Free shipping on all items", "7–10 days production + 5–7 days shipping") and its exchange-only rule are **India-store terms**. The US store's shipping, returns and lead times must come from you. Until then they appear as marked placeholders. The master brief's "exchange-only" line will only be used if you confirm it applies to the US store.

### This store's own catalogue issues (found in the same audit)

The redesign will surface these, so they need fixing in Admin. They are also listed in `placeholders-to-fill.md`.
- **Duplicate listings at different prices:** Chantell Accent Table ×3 ($230 / $299 / $350), Vendara Counter Stool ×3, Lopat End Table ×2, Eric Counter Stool ×2, Annabel Bench ×2, Rihanna Accent Chair ×2 ($575 / $1,050), Burano ×2 (fabric/leather, which probably should be one product with a Material option), Chantell Coffee Table ×2.
- **Handles with `-copy`**, and mismatched handles (`enzo-side-table-copy` → "Riley Side Table", `enzo-coffee-table-copy` → "Ariah Coffee Table").
- **Compare-at lower than price:** Ariah Coffee Table ($750, compare-at $725) would show a negative "sale". Cards will only show a compare-at when it is greater than the price.
- **Copy:** "OSIAC SOLID WOOD END TABLE" in all caps, "Tuffted", "embriodary", inconsistent "Set of 2" formatting.
- **Dimensions live only in description prose** in inconsistent formats ("20W x 14 D X 22", "42\" L x 24\" W x 17"). Stage B adds a `custom.dimensions` metafield (W/D/H plus shipping box) so the dimensions diagram and card line can be structured.
- **59 of 65 products have no product type**, so type-based filters won't work. Filters will use collections plus metafields (material, finish, room).
- **Mixed photo backdrops** (white cutout, grey, black, lifestyle, Askara plaster set). Cards use a neutral media surface so they sit together, but **reshooting hero images on the Askara set is the highest-impact visual fix**.

---

## 4. Image sources (for `images-manifest.csv` in the next step)

Askara images are original product and lifestyle photography from the brand's own shoots (filenames like `O0A5189i.jpg`), served from `askara.in/cdn/shop/files/` and `/collections/`. Candidates:
- Hero: `O0A5189i.jpg` · full-width band: `O0A4785.jpg`
- Category cards: `O0A5969` (side), `O0A5840` (coffee), `O0A5887_…` (accent chair), `O0A4907` (console), `O0A5772` (bench)
- Design-services portfolio images (Atlanta / Woodstock / Jodhpur projects): to inventory
- Logo files are **Askara-branded**, so they are not used here

**Flag:** the product-page block "Lone Fox × Joon Loloi" and any related imagery are third-party (Loloi). Excluded.

**Product photos** stay on this store's products (they already exist on the Mango store with 64 live items). Theme mockups use them for cards and the PDP.

---

## 5. Full page list for Mango Furniture Inc

| Page | Shopify template | Exists today? | Notes |
|---|---|---|---|
| Home | `index.json` | yes (to be replaced) | |
| Collection | `collection.json` | yes | filters via Search & Discovery |
| All collections / Shop by room | `list-collections.json` | yes | |
| Product | `product.json` | yes | |
| Cart page + drawer | `cart.json`, `cart-drawer` | yes | |
| Search (+ predictive) | `search.json` | yes | |
| Design Services | `page.design-services.json` | **new** | process, portfolio, enquiry form |
| Trade Program | `page.trade-program.json` | **new** | benefits, eligibility, application form |
| About | `page.about.json` | yes | Jodhpur story, craft, responsibility |
| Contact | `page.contact.json` | yes | form, phone/email/WhatsApp placeholders |
| FAQ | `page.faq.json` | **new** | fixes Askara's 404 |
| Shipping / Returns / Billing info | `page.json` (generic) | yes | content from Admin |
| Corporate Responsibility | `page.json` or `page.about` variant | **new page in Admin** | |
| Blog | `blog.json` | yes | |
| Article | `article.json` | yes | |
| Policy pages | Shopify-rendered `/policies/*` | n/a | styled via `base.css` only |
| Account: login / register / reset / activate | `customers/*.json` | yes | |
| Account: orders, order detail, addresses | `customers/account`, `order`, `addresses` | yes | |
| 404 | `404.json` | yes | |
| Password | `password.json` | yes | |
| Gift card | `gift_card.liquid` | yes | restyle only |

**Mockups planned in Stage A:** home, collection, product, cart (page + drawer), search, design-services, trade-program, about, contact, blog, article, faq, policy, account-login, account-orders, 404. Password and gift card reuse the login and policy patterns.

---

## 6. Inputs missing from the brief

- `shopify-redesign-master-prompt.md` and `AUDIT_REPORT.md` are **not in the repo** (searched the repo and its parents). Until they arrive I'll apply sensible defaults: LCP under 2.5s, CLS under 0.1, WCAG 2.2 AA, reduced-motion respected, and jQuery removed.
- Store purpose vs Askara and brand feel: see the questions that accompany these notes.
