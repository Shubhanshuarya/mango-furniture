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

## 2b. Cart drawer & page copy to confirm
- [ ] **Theme settings → Cart → Mango cart drawer**: the "Complete the room" upsell uses the *Accessories* collection (products already in the cart are skipped). Change the collection, heading or count there; clear the collection to hide it. "Drawer design → Classic" brings back the original drawer.
- [ ] Design Services → "Before you start" answers (theme editor): confirm the pricing model, custom-size lead time and service area. The current wording avoids promising any of these.

## 3. Product data (unlocks dimensions, specs, filters)
- [ ] **Settings → Custom data → Products → Add definition** (single line text unless noted):
  `custom.dimensions` (e.g. 56″ L × 16″ D × 19″ H), `custom.material`, `custom.box_dimensions`, `custom.net_weight`, `custom.shipping_weight`, `custom.assembly`, `custom.care` (multi-line), and optionally `custom.width`, `custom.depth`, `custom.height` (decimal, inches; these draw the dimension diagram).
- [ ] **Search & Discovery app → Filters**: add Product type, Material (metafield), Color and Price. They appear on collection pages automatically. Only Availability and Price exist today.
- [ ] **Search & Discovery → Product recommendations** (optional): set complementary products, then switch the product page "Recommendations" section to *Complementary*.
- [ ] Catalogue clean-up from `placeholders-to-fill.md` (duplicate listings, `-copy` handles, compare-at lower than price on Ariah Coffee Table, product types).

## 4. Contact & social
- [ ] WhatsApp: theme editor → Header → **WhatsApp number**. The icon and floating mobile button show once it's set.
- [ ] Theme settings → Social media: replace the `#` placeholders. The footer shows a link only when a real URL is set.

## 5. Customer accounts (classic, theme-designed)
The theme now has redesigned sign in, create account, forgot/reset password, account activation, order history, order detail and address pages. They only show once the store uses **classic** customer accounts (today it uses Shopify-hosted new accounts, which the theme cannot style).
- [ ] **Settings → Customer accounts** → choose the classic/legacy accounts option (Shopify labels it "Legacy" or "Classic"). Note: Shopify is phasing this option out; if it is no longer offered, use the branding fallback below.
- [ ] Test: sign up, sign out, sign in, "Forgot password?", add/edit/delete an address, place a test order and open it from the account page.
- [ ] Optional: theme editor → account pages → set the side image, quote and an extra menu link (e.g. "Trade program").
- Fallback (if you stay on new accounts): **Settings → Checkout → Customize → Branding**: background `#F5F0E8`, surfaces `#EDE5D8`, text `#2A211B`, accent/buttons `#A0533A`, large corner radius, same logo as the header.

## 6. Before publishing
- [ ] **Decide the target theme.** This repo was pulled from the unpublished theme "Copenhagen" (#193145438500), not your live theme "Updated copy of Copy of OG Copenhagen 2" (#193145241892). Recommended: `shopify theme push --unpublished` to create a fresh preview theme from this branch, review it on your phone, then publish it from Admin.
- [ ] Confirm returns wording. The live refund policy says 14-day returns in original packaging; the FAQ currently links to the policy rather than restating it.
- [ ] Test checkout once on the preview theme (add to cart → drawer → checkout → Shop Pay).

- [ ] **Preview server check:** run `shopify theme dev --store 091ee8-79.myshopify.com`. Without `--store`, the CLI uses its last store; on 2026-10-10 it was serving this theme on *wholesaleabaya.myshopify.com* as a development theme (not live there, but worth deleting from that store's theme list).

## Rollback
Every old section is still in its template, just **disabled**. In the theme editor you can re-enable any of them (and hide the Mango one) without touching code. In git, `main` is untouched.
