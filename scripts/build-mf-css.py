#!/usr/bin/env python3
"""Build theme CSS assets from the approved Stage A design CSS.

    python3 -I scripts/build-mf-css.py

Source of truth: design/tokens.css, base.css, components.css, pages.css, responsive.css.
Output:          assets/mf-base.css (tokens + shared components)
                 assets/mf-<group>.css for each page group in GROUPS that is enabled.

Transforms, so the new styles can never leak into (or be broken by) the existing theme:
  * every class selector .foo  -> .mf-foo        (theme has its own .card, .price, .badge …)
  * element / universal / :root / body selectors are scoped under .mf
  * rem -> px (this theme sets html { font-size: 10px }, the mockups assume 16px)
  * @keyframes names prefixed with mf-
  * dark-mode token block dropped (not enabled for the storefront)
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DESIGN = ROOT / 'design'
ASSETS = ROOT / 'assets'

# First class in a selector decides which output file a rule belongs to.
SHELL = r'announcement|site-header|header-\w+|header-inner|logo|nav-trigger|mega[\w-]*|drawer[\w-]*|mnav[\w-]*|search-panel|search-bar|search-results|suggest|search-cards|modal[\w-]*|quickview|qv-\w+|lightbox[\w-]*|toast[\w-]*|site-footer|footer-\w+|newsletter|wa-fab|sticky-atc|skip-link|state-note|scrim|filter-drawer-foot'
GROUPS = {
    'home': r'benefits|hero[\w-]*|bento|tile[\w-]*|lookbook[\w-]*|hotspot[\w-]*|look-\w+|inverse|ds-\w+|quotes?|ugc|stats?|split[\w-]*|steps|services?|articles?|article-card[\w-]*',
    'collection': r'collection|coll-[\w-]+|subcats|toolbar[\w-]*|density|facets?[\w-]*|facet-[\w-]+|range|promo-tile|filter-[\w-]+',
    'product': r'product|pdp[\w-]*|gallery|g|g--media|media-slot|mobile-gallery|buy-row|delivery|pdp-links|dim-diagram|spec|story-band|scroller[\w-]*|variant-picker|terms|dynamic-checkout|ar-btn|rte-sm|feature-cols?|recs',
    'cart': r'cart-[\w-]+|summary|trust-row|ship-note',
    'pages': r'process|projects?|form-card|form-split|contact-list|values|v|about-gallery|big-quote|faq-[\w-]+|text-steps|loc',
    # Later stages (enable when the page is built):
    # 'product': r'pdp[\w-]*|gallery|media-slot|mobile-gallery|buy-row|delivery|pdp-links|dim-diagram|spec|story-band|scroller[\w-]*',
}
ENABLED = ['home', 'shell', 'collection', 'product', 'cart', 'pages']
# Selectors from pages.css that belong to not-yet-built pages are skipped entirely.
LATER = r'article-hero|article-cover|article-body|article-aside|inline-product|progress|auth[\w-]*|divider|btn--shop|account[\w-]*|order[\w-]*|status[\w-]*|timeline|nf|card\.is-soldout'



def strip_comments(css):
    return re.sub(r'/\*.*?\*/', '', css, flags=re.S)


def parse(css):
    """Return a list of (prelude, body) at one nesting level. body is str for rules, list for at-rule blocks."""
    out, i, n = [], 0, len(css)
    while i < n:
        j = css.find('{', i)
        if j == -1:
            break
        prelude = css[i:j].strip()
        depth, k = 1, j + 1
        while depth and k < n:
            if css[k] == '{':
                depth += 1
            elif css[k] == '}':
                depth -= 1
            k += 1
        inner = css[j + 1:k - 1]
        if prelude.startswith('@media') or prelude.startswith('@supports'):
            out.append((prelude, parse(inner)))
        else:
            out.append((prelude, inner.strip()))
        i = k
    return out


def split_selectors(prelude):
    parts, depth, cur = [], 0, ''
    for ch in prelude:
        if ch in '([':
            depth += 1
        elif ch in ')]':
            depth -= 1
        if ch == ',' and depth == 0:
            parts.append(cur.strip()); cur = ''
        else:
            cur += ch
    if cur.strip():
        parts.append(cur.strip())
    return parts


def first_class(sel):
    m = re.search(r'\.([a-zA-Z][\w-]*)', sel)
    return m.group(1) if m else None


def classify(prelude):
    """'shell' | 'later' | group name | 'base' | 'drop'."""
    sels = split_selectors(prelude)
    if any(s.startswith('[data-theme') or ':root[data-theme' in s or s.startswith('html') for s in sels):
        return 'drop'
    # body.is-locked / body.header-hidden etc. are shell behaviours
    if any(re.match(r'body\.', s) for s in sels):
        return 'shell'
    cls = [first_class(s) for s in sels if first_class(s)]
    if not cls:
        return 'base'
    c = cls[0]
    if re.fullmatch(SHELL, c):
        return 'shell'
    for g, pat in GROUPS.items():
        if re.fullmatch(pat, c):
            return g
    if re.fullmatch(LATER, c) or re.match(LATER, c):
        return 'later'
    return 'base'


def scope_selector(sel):
    # prefix classes
    sel = re.sub(r'\.([a-zA-Z][\w-]*)', lambda m: '.mf-' + m.group(1), sel)
    s = sel.strip()
    # Reveal animations only hide content once the theme's html.js class is set.
    if s.startswith('.mf-reveal'):
        return '.js ' + s
    if s in (':root',) or s.startswith(':root'):
        return '.mf' + s[len(':root'):]
    if s.startswith('body.'):
        return s  # state classes toggled on <body> by mf scripts (e.g. body.mf-has-sticky-atc)
    if s.startswith('body'):
        return '.mf' + s[len('body'):]
    if s.startswith('.mf-'):
        return s
    # element, universal, attribute or pseudo selectors -> scope under :where(.mf) so the scope adds
    # zero specificity and the approved design's cascade (e.g. .card-title beating h3) is preserved.
    return ':where(.mf) ' + s


def transform_body(body):
    body = re.sub(r'(?<![\w.-])(\d*\.?\d+)rem\b', lambda m: f"{float(m.group(1)) * 16:g}px", body)
    body = re.sub(r'counter-(reset|increment):\s*([a-z-]+)', r'counter-\1: mf-\2', body)
    body = re.sub(r'counter\(([a-z-]+)', r'counter(mf-\1', body)
    body = re.sub(r'animation:\s*([a-z-]+)', lambda m: 'animation: ' + (m.group(1) if m.group(1).startswith('mf-') or m.group(1) == 'none' else 'mf-' + m.group(1)), body)
    return body


def emit(rules, want, indent=''):
    out = []
    for prelude, body in rules:
        if isinstance(body, list):
            inner = emit(body, want, indent + '  ')
            if inner.strip():
                media = re.sub(r'(\d*\.?\d+)rem', lambda m: f"{float(m.group(1)) * 16:g}px", prelude)
                out.append(f'{indent}{media} {{\n{inner}{indent}}}\n')
            continue
        if prelude.startswith('@keyframes'):
            if want == 'base':
                name = prelude.split()[1]
                out.append(f'{indent}@keyframes mf-{name} {{ {transform_body(body)} }}\n')
            continue
        if prelude.startswith('@'):
            continue
        if classify(prelude) != want or prelude.startswith('.no-js'):
            continue
        sels = ', '.join(scope_selector(s) for s in split_selectors(prelude))
        out.append(f'{indent}{sels} {{ {transform_body(body)} }}\n')
    return ''.join(out)


def main():
    src = ''.join(strip_comments((DESIGN / f).read_text()) for f in ('tokens.css', 'base.css', 'components.css', 'pages.css', 'responsive.css'))
    rules = parse(src)
    header = ('/* GENERATED by scripts/build-mf-css.py from design/*.css. Do not edit by hand. */\n'
              '/* Scoped: every class is prefixed mf-, element rules live under .mf. */\n')
    fonts = """@font-face { font-family: "MF Fraunces"; src: url("mf-fraunces.woff2") format("woff2"); font-style: normal; font-weight: 300 600; font-display: swap; }
@font-face { font-family: "MF Fraunces"; src: url("mf-fraunces-italic.woff2") format("woff2"); font-style: italic; font-weight: 300 600; font-display: swap; }
@font-face { font-family: "MF Figtree"; src: url("mf-figtree.woff2") format("woff2"); font-style: normal; font-weight: 400 700; font-display: swap; }
"""
    base = emit(rules, 'base')
    # Theme-collision guards: the theme styles bare h1–h6, p, a, button globally.
    guards = """.mf { font-size: 16px; }
.mf h1, .mf h2, .mf h3, .mf h4 { margin: 0; text-transform: none; max-width: none; color: inherit; letter-spacing: var(--display-tracking); }
.mf .mf-card-title, .mf .mf-card-title a, .mf h3.mf-card-title { letter-spacing: 0; }
.mf p { color: inherit; }
.mf a { color: inherit; }
/* Buttons that are links: keep the button colour (the generic link reset above must not win) */
.mf a.mf-btn, .mf a.mf-btn:hover, .mf a.mf-btn:visited, .mf a.mf-btn:focus,
.mf button.mf-btn, .mf button.mf-btn:hover, .mf button.mf-btn:focus { color: var(--btn-fg); text-decoration: none; }
.mf :focus-visible { box-shadow: none; outline-offset: 3px; }
/* Theme integration: <product-form> adds .loading to its submit button; errors render in .mf-card-error */
.mf product-form { display: contents; }
.mf .loading { position: relative; color: transparent !important; pointer-events: none; }
.mf .loading::after { content: ""; position: absolute; inset: 0; margin: auto; width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--color-ink); border-right-color: transparent; animation: mf-spin 700ms linear infinite; }
.mf .mf-btn--accent.loading::after, .mf .mf-btn.loading::after { border-color: var(--btn-fg); border-right-color: transparent; }
.mf .mf-card-error { position: absolute; left: 10px; right: 10px; bottom: 62px; z-index: 2; background: var(--color-bg); color: var(--color-error); font-size: 13px; padding: 8px 10px; border-radius: var(--radius-sm); }
.mf .mf-placeholder-svg { width: 100%; height: 100%; fill: var(--color-ink-muted); opacity: 0.35; background: var(--color-surface-media); }
.mf .mf-editor-note { padding: 16px; border: 1px dashed var(--color-line); border-radius: var(--radius-md); color: var(--color-ink-muted); font-size: 14px; }
"""
    base = base.replace('"Fraunces"', '"MF Fraunces"').replace('"Figtree"', '"MF Figtree"')
    (ASSETS / 'mf-base.css').write_text(header + fonts + base + guards)
    print(f'assets/mf-base.css  {len(base) / 1024:.1f} KB')
    for g in ENABLED:
        css = emit(rules, g)
        if g == 'shell':
            # Hand-written, unprefixed rules that must target the theme's own markup (cart drawer, cart bubble).
            css += '\n/* ---- theme integration (design/theme-raw.css, not prefixed) ---- */\n' + (DESIGN / 'theme-raw.css').read_text()
        (ASSETS / f'mf-{g}.css').write_text(header + css)
        print(f'assets/mf-{g}.css  {len(css) / 1024:.1f} KB')


if __name__ == '__main__':
    sys.exit(main())
