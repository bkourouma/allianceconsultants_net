---
name: Alliance Consultants - Le Carnet de coupons
description: Public site as a wallet of official service coupons on cool paper - heavy navy rules, perforations, one red stub, rubber stamps.
colors:
  ink-navy: "#0f2a5a"
  ink-soft: "#3a4a70"
  ink-mute: "#4a5878"
  rule-grey: "#c3cadb"
  cool-paper: "#eef0f5"
  coupon-white: "#ffffff"
  stub-lilac: "#f6f5fb"
  night-navy: "#0a1d40"
  signal-red: "#d6342a"
  signal-red-deep: "#b02820"
  carbon-purple: "#5b4aa8"
  tab-docupro: "#1457f5"
  tab-medicpro: "#098240"
  tab-cliniquepro: "#00789a"
  tab-immotopia: "#f26a1b"
  tab-annonces: "#e0245e"
  tab-ecole: "#f5b800"
typography:
  display:
    fontFamily: "Barlow Condensed, Arial Narrow, system-ui, sans-serif"
    fontSize: "clamp(2.75rem, 1.7rem + 5vw, 5.75rem)"
    fontWeight: 800
    lineHeight: 0.94
    letterSpacing: "-0.012em"
  headline:
    fontFamily: "Barlow Condensed, Arial Narrow, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 1.5rem + 3vw, 4rem)"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Barlow Condensed, Arial Narrow, system-ui, sans-serif"
    fontSize: "clamp(1.4rem, 1.15rem + 1vw, 2rem)"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "0"
  lead:
    fontFamily: "Barlow, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(1.0625rem, 1rem + 0.35vw, 1.3125rem)"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "Barlow, Segoe UI, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Chivo Mono, ui-monospace, Cascadia Mono, monospace"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "0.08em"
rounded:
  sm: "3px"
  md: "4px"
  lg: "8px"
  lifted: "10px"
spacing:
  gutter: "clamp(1rem, 4vw, 2.5rem)"
  wrap-max: "80rem"
  touch: "2.75rem"
components:
  button-primary:
    backgroundColor: "{colors.signal-red}"
    textColor: "{colors.coupon-white}"
    rounded: "{rounded.sm}"
    height: "3rem"
    padding: "0 1.5rem"
  button-primary-hover:
    backgroundColor: "{colors.signal-red-deep}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink-navy}"
    rounded: "{rounded.sm}"
    height: "3rem"
    padding: "0 1.5rem"
  button-secondary-hover:
    backgroundColor: "{colors.ink-navy}"
    textColor: "{colors.coupon-white}"
  coupon:
    backgroundColor: "{colors.coupon-white}"
    textColor: "{colors.ink-navy}"
    rounded: "{rounded.md}"
  coupon-stub:
    backgroundColor: "{colors.stub-lilac}"
    textColor: "{colors.ink-navy}"
  stamp:
    textColor: "{colors.signal-red}"
    rounded: "{rounded.sm}"
    padding: "0.2em 0.6em"
  field-caption:
    textColor: "{colors.ink-mute}"
    typography: "{typography.label}"
---

# Design System: Alliance Consultants - Le Carnet de coupons

Scope: the public site only (everything under `.site-root`, the `(site)` route group). The `/admin` backoffice keeps its legacy generic-blue tokens (`--color-primary`, `--color-primary-dark`, `--color-accent`, `--color-dark`, Inter) defined in the same `globals.css` outside `.site-root`; it is not part of this system and must not inherit it.

## Overview

**Creative North Star: "Le Carnet de coupons"**

The offer is a carnet of official service coupons. Each solution is a numbered white coupon with a heavy navy rule; commitments are rubber-stamped; things are validated or filed, never faded. Trust comes from official-document devices (perforation, stub, stamp, carbon figures) set on a calm cool-paper ground. The tone is premium, calm and a little playful, never technical or busy.

Depth is flat paper plus honest edges: thickness is carried by a 2px navy rule, not by shadow. Motion is one authored moment per section (coupon lift, stub tear, stamp press); everything else is still, and reduced-motion shows the static stamped state.

**Key Characteristics:**
- White coupon, 2px navy border, 4px radius, dashed tear line, red stamp, on cool paper: recognisable with content removed.
- Italic 800 condensed headlines, large and tight.
- One red thing per region: the primary stub, a stamp, or the active mark.
- Product colours appear only as small coupon tabs and chips.
- Mono uppercase captions live only inside coupons and controls.

## Colors

A navy-and-paper palette with a single signal red and a purple reserved for carbon-copy numerals.

### Primary
- **Carrier Navy** (`ink-navy`): text, every 2px rule, outlined buttons, the coupon header band, selection and the focus ring on inner pages. Ink on paper contrast is high; this is the default text colour.
- **Signal Red** (`signal-red`): the primary action stub, stamps, and active/selected marks (active nav underline, status dot). Hover goes to `signal-red-deep`.

### Secondary
- **Carbon Purple** (`carbon-purple`): filled figures only - the big coupon numerals (01...06) as if carbon-copied. Never for text, links or buttons. It is also the Académie product tab colour (`--color-line-academie`).

### Tertiary
- **Product tabs**: DocuPro `tab-docupro`, MedicPro `tab-medicpro`, CliniquePro `tab-cliniquepro`, ImmoTopia `tab-immotopia`, Annonces `tab-annonces`, École `tab-ecole`. Scoped through `.line-<id>` which sets `--accent` and `--on-accent` (dark ink on orange and yellow, white elsewhere). Used as chips, header tabs and small markers.

### Neutral
- **Cool Paper** (`cool-paper`): page ground. **Coupon White** (`coupon-white`): coupon and top-bar stock. **Stub Lilac** (`stub-lilac`): the detachable stub fill. **Ink Soft / Ink Mute**: lead and caption text. **Rule Grey**: hairline field boxes. **Night Navy**: footer and dark bands.

### Named Rules
**The One Red Rule.** Red is the primary stub, stamps and active/selected marks, nothing else. It is never a background wash, heading colour or decorative accent.
**The Tab-Only Rule.** Product colours are small coupon tabs and chips. They never fill a section, a card face or a headline.
**The Carbon Rule.** Purple is for numerals only.

## Typography

**Display Font:** Barlow Condensed (Arial Narrow, system-ui), weights 500-800 with italic.
**Body Font:** Barlow (Segoe UI, system-ui), weights 400-600.
**Label/Mono Font:** Chivo Mono (ui-monospace), weights 400-600.

**Character:** Condensed italic signage headlines over a friendly humanist text face, with typewriter-like mono for the form fields of the coupon.

### Hierarchy
- **Display** (italic 800, clamp 2.75rem to 5.75rem, 0.94): the home H1 only.
- **Headline** (italic 800, clamp 2.25rem to 4rem, 0.98): section titles.
- **Title** (upright 700, clamp 1.4rem to 2rem, 1.08): coupon and card titles.
- **Lead** (400, clamp 1.0625rem to 1.3125rem, 1.55, 62ch, Ink Soft): intro paragraphs.
- **Body** (400, 1rem, 1.55, 68ch max): running text, pretty-wrapped.
- **Label** (mono 500, 0.6875rem, 0.08em tracking, uppercase, Ink Mute): field captions, nav, stamp text.

### Named Rules
**The Inside-Only Rule.** Mono uppercase captions appear inside coupons and controls (field captions, nav, stub captions, stamps). Never as a small label above a section heading.
**The Tight Display Rule.** Display tracking never goes below -0.04em; headlines balance-wrap.
**The Tabular Rule.** Figures that compare use tabular numerals.

## Layout

One centred wrapper: 80rem max with fluid gutters (`clamp(1rem, 4vw, 2.5rem)`). The home first viewport is a split: copy about 52% left (H1, lead, red CTA plus outlined CTA, a ruled facts line), wallet about 46% right; it stacks under about 1100px. Sticky top bar is 4rem tall (4.5rem from 1024px) with a 2px navy bottom rule. Sections alternate paper and white coupon bands with generous vertical rhythm; lists of products are strict stacked rows, not equal-size icon cards. Touch targets are at least 2.75rem (44px). Anchored scrolling clears the sticky bar (scroll-padding 120px).

## Elevation & Depth

Hybrid, but ambient only. Thickness is the 2px navy rule; shadows are soft, offset-and-blurred lifts that never form a hard offset block.

### Shadow Vocabulary
- **Coupon rest** (`box-shadow: 0 1px 2px rgb(15 42 90 / 0.14), 0 10px 18px -10px rgb(15 42 90 / 0.32)`): standard coupon and list row (rows use an 8px lower blur).
- **Coupon lifted** (`box-shadow: 0 1px 2px rgb(15 42 90 / 0.14), 0 22px 30px -14px rgb(15 42 90 / 0.38)`): the one lifted, tilted hero coupon.
- **Red stub** (`box-shadow: 0 8px 16px -8px rgba(176,40,32,0.55)`): primary button; flattens on press with a 2px sink.

### Named Rules
**The Rule-Is-Thickness Rule.** If something needs to feel solid, thicken the navy rule; do not add a hard offset shadow.

## Shapes

Small, official radii: 4px coupons, 3px buttons, chips and stamps, 8px list rows, 10px only on the lifted hero coupon. Borders are 2px navy. Perforation is a 2px dashed navy line, horizontal (`tear`) or vertical (stub's left edge). The lifted coupon has a half-moon notch bitten out of its bottom edge at the tear line. Stamps are rotated -4deg to -6deg, with slightly translucent ink and an inset ghost ring. Focus is a 3px outline offset 3px in the current accent.

## Components

### Buttons
- **Shape:** 3px radius, 2.75 to 3.5rem tall, display font 700 uppercase, 0.06em tracking, trailing arrow that nudges 2px on hover.
- **Primary (the red stub):** `signal-red` fill, white text, red ambient shadow; hover `signal-red-deep`; active sinks 2px. One per view region.
- **Secondary:** transparent with a 2px inset navy ring; hover fills navy with white text. On dark bands it inverts to a white ring.

### Coupons / Containers
- White stock, 2px navy border, 4px radius (8px in rows), Coupon rest shadow. Inside: a navy header band with a product chip, ruled field boxes, mono field captions, carbon numerals, and a detachable `coupon-stub` on the right (or below on mobile) separated by the dashed tear line.

### Navigation
- White bar, navy bottom rule; links in mono caps with a red underline on the active page; outlined "Contact & Démo" at the right; mobile is a full-height sheet with a bordered menu button and a red CTA. Product entries carry their tab chip.

### Hero wallet (signature)
- Coupon 1 is lifted and tilted (about -1.5deg) with a navy header, chip, route arc, carbon number and red stub CTA, plus one red stamp pressed on load. Pressing the stub tears it off (400ms) and re-slams the stamp. Five rows below are picks; hovering one nudges it 6px left. Reduced-motion shows the static stamped state.

### Stamp
- Red 2px border, mono (or display 800 on the hero) uppercase, rotated, used for confirmations such as "DÉMO DEMANDÉE".

## Do's and Don'ts

### Do:
- **Do** build new surfaces from white coupons with a 2px navy rule on cool paper.
- **Do** keep one red element per region: the primary stub, a stamp, or an active mark.
- **Do** scope a product accent with its `.line-<id>` class and show it as a small tab.
- **Do** keep mono uppercase captions inside coupons and controls.
- **Do** provide a static equivalent for every animated moment.

### Don't:
- **Don't** use red as decoration, fills or headings.
- **Don't** use hard zero-blur offset shadows; use the ambient vocabulary.
- **Don't** make equal-size icon-heading-text card grids, metro maps, gradients, or travel imagery.
- **Don't** put mono kickers above section headings.
- **Don't** let admin legacy tokens (`--color-primary`, Inter) leak into the public site.
