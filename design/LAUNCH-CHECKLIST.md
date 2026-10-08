# Launch checklist: Mango redesign

Everything in the theme is built on branch `redesign-askara-ref`. These are the Admin tasks that make it complete. Nothing here changes the live site until the theme is published.

## 1. Images (makes every placeholder disappear)
- [ ] **Admin → Content → Files → Upload** every file in `design/assets/askara/` **without renaming** them. The sections already point to these filenames (`shopify://shop_images/<name>.webp`), so they appear automatically.
- [ ] Optional: replace them later with your own photography in the theme editor (every image is an image picker).

## 2. Pages
- [ ] **Online Store → Pages → Add page** "Design Services" with handle `design-services` and template **page.design-services**.
- [ ] "Trade Program", handle `trade-program`, template **page.trade-program**.
- [ ] "FAQ", handle `faq`, template **page.faq**.
- [ ] **About Us** page: switch the template to **page.about** to get the story layout. (It currently uses the generic page template, which shows your Admin copy in the new style.)
- [ ] Then repoint the temporary links that go to Contact: Home hero "Talk to our team", the Home "Trade pricing" card, product link cards and the collection promo tile. All of these are editable in the theme editor.

## 3. Product data (unlocks dimensions, specs, filters)
- [ ] **Settings → Custom data → Products → Add definition** (single line text unless noted):
  `custom.dimensions` (e.g. 56″ L × 16″ D × 19″ H), `custom.material`, `custom.box_dimensions`, `custom.net_weight`, `custom.shipping_weight`, `custom.assembly`, `custom.care` (multi-line), and optionally `custom.width`, `custom.depth`, `custom.height` (decimal, inches; these draw the dimension diagram).
- [ ] **Search & Discovery app → Filters**: add Product type, Material (metafield), Color and Price. They appear on collection pages automatically. Only Availability and Price exist today.
- [ ] **Search & Discovery → Product recommendations** (optional): set complementary products, then switch the product page "Recommendations" section to *Complementary*.
- [ ] Catalogue clean-up from `placeholders-to-fill.md` (duplicate listings, `-copy` handles, compare-at lower than price on Ariah Coffee Table, product types).

## 4. Contact & social
- [ ] WhatsApp: theme editor → Header → **WhatsApp number**. The icon and floating mobile button show once it's set.
- [ ] Theme settings → Social media: replace the `#` placeholders. The footer shows a link only when a real URL is set.

## 5. Customer accounts (Shopify-hosted)
Your store uses new customer accounts, so sign-in and order history are Shopify pages. Match them to the theme in **Settings → Checkout / Customer accounts → Customize → Branding**:
- Background `#F5F0E8`, surfaces `#EDE5D8`, text `#2A211B`, accent and buttons `#A0533A`, corner radius *large* (pill buttons).
- Fonts: closest Shopify fonts to Fraunces (headings) and Figtree (body), e.g. *Fraunces* if offered, otherwise *Playfair Display* / *Inter*.
- Logo: the same logo as the header.

## 6. Before publishing
- [ ] **Decide the target theme.** This repo was pulled from the unpublished theme "Copenhagen" (#193145438500), not your live theme "Updated copy of Copy of OG Copenhagen 2" (#193145241892). Recommended: `shopify theme push --unpublished` to create a fresh preview theme from this branch, review it on your phone, then publish it from Admin.
- [ ] Confirm returns wording. The live refund policy says 14-day returns in original packaging; the FAQ currently links to the policy rather than restating it.
- [ ] Test checkout once on the preview theme (add to cart → drawer → checkout → Shop Pay).

## Rollback
Every old section is still in its template, just **disabled**. In the theme editor you can re-enable any of them (and hide the Mango one) without touching code. In git, `main` is untouched.
