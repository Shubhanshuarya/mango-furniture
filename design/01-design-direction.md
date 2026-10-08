# 01 — Design direction

Both directions share one structure: the same tokens file, spacing rhythm, components and page layouts. They differ only in palette, type, radius and tone of voice. That makes the choice cheap, because the full page set is built once and whichever direction wins sets the tokens.

**See them side by side:** open `design/index.html`, choose **Direction sample**, then flip between A and B and between desktop and mobile.

---

## A. Atelier: warm artisan editorial (recommended)

> "From our Jodhpur workshop to your home."

| | |
|---|---|
| Feel | Warm, tactile, calm luxury. It reads like a maker's catalogue, not a marketplace. |
| Palette | Limewash `#F5F0E8` · plaster `#EDE5D8` · walnut ink `#2A211B` · **terracotta accent `#A0533A`** · all sampled from the Askara set (plaster wall, tile floor, walnut pieces). |
| Type | **Fraunces** (variable serif with optical size and a soft axis) for display; **Figtree** (variable sans) for text and UI. Both free (OFL), self-hosted as WOFF2 in Stage B. |
| Shape | Soft radius (12px cards, 14px media), pill buttons. |
| Layout | Editorial and asymmetric: a 7/5 hero split, a bento category grid with one tall tile, generous section padding (64→128px). |
| Signature details | A small-caps eyebrow over each heading; a hairline "dimension rule" under product names (W × D × H in a mono-like tabular figure); a stamp-style "Handmade in Jodhpur" mark. |
| Motion | 520ms ease-out reveals (fade plus an 18px rise), image scale 1.00→1.03 on hover, and the header hides on scroll down and shows on scroll up. |
| Risk | Serif plus warm tones can tip into "rustic". Keep it modern with tight tracking, plenty of white space and strict alignment. |

## B. Gallery: quiet modern minimal

> "Solid mango wood. Nothing extra."

| | |
|---|---|
| Feel | Scandinavian gallery: product-first, quiet and precise. |
| Palette | Off-white `#FAFAF8` · stone `#F1F0EC` · ink `#171717` · **deep olive accent `#3E4A36`**. |
| Type | **Inter Tight** for display (tight, large) and **Inter** for text. Inter is in Shopify's font library; Inter Tight is self-hosted. |
| Shape | Near-square (2–6px radius), square media, rectangular buttons. |
| Layout | A strict 12-column grid, full-bleed imagery, a numbered index-style category list, oversized type. |
| Signature details | Numbered sections (01 / 02 / 03), specification tables, hairline dividers. |
| Motion | Shorter (280ms), mostly opacity, with almost no movement. |
| Risk | It can feel generic or interchangeable with any DTC store, and it fights the warm, mixed-backdrop product photography. |

---

## Recommendation: A (Atelier)

1. **The photography already is Atelier.** Askara's set (limewash wall, terracotta floor) and the walnut and leather pieces carry the palette, so the UI extends the photos instead of competing with them. Gallery's cool off-white makes the warm tiles look orange.
2. **Differentiation in the US market.** "Handcrafted mango wood from a family workshop in Jodhpur" is the story buyers pay for. A serif editorial voice signals craft and justifies a $400–$1,300 price point better than a neutral grotesk does.
3. **It absorbs mixed product backdrops.** The warm `surface-media` plinth behind cards blends white, grey and plaster backgrounds more forgivingly than Gallery's near-white.
4. **Conversion isn't traded away.** Same CTA hierarchy, same sticky ATC, same card density, and the terracotta accent is reserved for primary actions only.

## Decisions made without asking (noted for you)

- **Fonts self-hosted, not Google-hosted, in Stage B.** This avoids a third-party connection and the related privacy and performance costs. The mockups load Google Fonts for convenience only.
- **Dark mode is designed but off by default.** It's a nice-to-have for a furniture store; the tokens are ready if you want a toggle.
- **WhatsApp:** a header icon on desktop and a floating button on mobile, which hides while the cart drawer or sticky ATC is open so it never covers a CTA. The number is a placeholder until you confirm the US number (Askara's is Indian, +91).
- **No carousels for primary content on mobile.** Categories use a 2-column bento so everything is visible without swiping. Horizontal scroll is used only for "complete the look" and similar secondary rows.
- **No autoplay hero slideshow.** It's slower for LCP and lowers CTA clicks. Instead the hero is one still image with a clear CTA.
