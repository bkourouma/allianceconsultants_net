---
name: Alliance Consultants — RÉSEAU
description: Daylight metro-signage world. Cool enamel ground, ink-navy type, seven saturated line colours, ringed stations.
colors:
  ink: "#0b1b3a"
  ink-soft: "#3a4764"
  ink-mute: "#5b6784"
  enamel: "#f3f5fa"
  panel: "#ffffff"
  rule: "#d5dbea"
  night: "#07122b"
  night-2: "#0e2149"
  brand: "#1457f5"
  line-docupro: "#1457f5"
  line-medicpro: "#098240"
  line-cliniquepro: "#00789a"
  line-immotopia: "#f26a1b"
  line-annonces: "#e0245e"
  line-ecole: "#f5b800"
  line-academie: "#6d3be0"
  error-text: "#b4123f"
  error-surface: "#fdeaf0"
typography:
  display:
    fontFamily: "Bricolage Grotesque, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 1.6rem + 4.6vw, 5.5rem)"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Bricolage Grotesque, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(2rem, 1.3rem + 2.8vw, 3.75rem)"
    fontWeight: 750
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Bricolage Grotesque, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 1.05rem + 0.9vw, 1.75rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  lead:
    fontFamily: "Figtree, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(1.0625rem, 1rem + 0.35vw, 1.3125rem)"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "Figtree, Segoe UI, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Figtree, Segoe UI, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 700
    letterSpacing: "0.01em"
rounded:
  sm: "4px"
  lg: "8px"
  xl: "12px"
  full: "9999px"
spacing:
  gutter: "clamp(1rem, 4vw, 2.5rem)"
  header-mobile: "64px"
  header-desktop: "72px"
  container: "80rem"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.panel}"
    rounded: "{rounded.full}"
    height: "44px"
    padding: "0 6px 0 20px"
  button-primary-hover:
    backgroundColor: "{colors.night-2}"
  button-primary-on-dark:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    height: "44px"
  panel:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "16px"
  input:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    height: "48px"
    padding: "0 14px"
  segmented-control:
    backgroundColor: "{colors.enamel}"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.full}"
  alert-error:
    backgroundColor: "{colors.error-surface}"
    textColor: "{colors.error-text}"
    rounded: "{rounded.lg}"
    padding: "16px"
---

# Design System: Alliance Consultants — RÉSEAU

Scope: the public site (everything under the site root wrapper). The `/admin` backoffice is out of scope and keeps the legacy tokens (`--color-primary` #1d4ed8, `--color-dark`, `--color-accent`, Inter) that are still declared in `globals.css`. Do not apply this system there, and do not use the legacy tokens on public surfaces.

## Overview

**Creative North Star: "Daylight Station Signage"**

Alliance is drawn as a transit network, not a catalogue. Each solution is a colour-coded line, each module a station, services are interchanges, formations form the circular Académie line, and the demo request is the terminus. The ground is a cool enamel with white signage panels, ink-navy type and hairline rules; one night-navy family is reserved for contrast sections (final call to action, automation simulator). Colour is spent at page scale: thick strokes, section spines, full colour bands, never sprinkled accents.

Display type is large and tight (Bricolage Grotesque, 800, tracking -0.035em); text is Figtree. Controls are fully round pills, content panels are modestly rounded (8px), and structure is drawn with 1px rules in the enamel-blue rule colour. The recognisable silhouette with content removed: coloured parallel strokes bending at 45 degrees with ringed stations.

**Key Characteristics:**
- One accent per scope: `--accent` / `--on-accent` are set per product line and everything inside inherits them.
- Ink-navy is the structural colour (type, primary buttons, rules); lines carry meaning.
- Flat panels, hairline rules; shadows only on lifted previews and open menus.
- Station vocabulary: ringed dots, white dots with ink ring, coloured roundels with a one-letter glyph.
- Reveal-on-scroll and route spine motion, all disabled under reduced motion.

## Colors

A cool, daylight-lit navy and enamel base with seven saturated line colours.

### Primary
- **Ink Navy** (#0b1b3a): body type, primary pill buttons, selection, hairline strokes, neutral stations.
- **Brand Signal Blue** (#1457f5): default `--accent` outside a product scope; the site-wide focus ring colour and header route colour; identical to the DocuPro line.

### Secondary (the lines, scoped by section or card via the line class or inline style)
- **DocuPro Blue** (#1457f5), **MedicPro Green** (#098240), **CliniquePro Teal** (#00789a), **Immotopia Orange** (#f26a1b, ink text on top), **Annonces Magenta** (#e0245e), **École Yellow** (#f5b800, ink text on top), **Académie Violet** (#6d3be0, used for formations).
- Orange and yellow take ink as their on-colour; all others take white. This pairing is carried by `--on-accent`.

### Neutral
- **Enamel** (#f3f5fa): page ground. **Panel White** (#ffffff): header, cards, form surfaces. **Rule** (#d5dbea): hairlines and panel rings.
- **Ink Soft** (#3a4764): secondary text. **Ink Mute** (#5b6784): hints, inactive stations, input borders at reduced opacity.
- **Night** (#07122b) and **Night 2** (#0e2149): the single dark panel family and primary-button hover.
- **Error** text (#b4123f) on **Error Wash** (#fdeaf0) for form errors.

### Named Rules
**The One Line Rule.** Inside any scope exactly one line colour is active, delivered through `--accent`. Never place two line colours as competing accents in the same card; a multi-line view (map, lineup) shows them as parallel strokes, not as decoration.
**The Ink On Yellow Rule.** Text on orange and yellow is ink, never white. Take the on-colour from `--on-accent`.

## Typography

**Display Font:** Bricolage Grotesque (opsz and wdth axes; Segoe UI, system-ui fallback)
**Body Font:** Figtree (Segoe UI, system-ui fallback)

**Character:** A characterful, tight grotesque for signage-scale headings paired with a friendly, legible text face.

### Hierarchy
- **Display** (800, clamp 2.5rem to 5.5rem, 0.98, -0.035em): homepage H1 only.
- **Headline** (750, clamp 2rem to 3.75rem, 1.02, -0.03em): section titles.
- **Title** (700, clamp 1.25rem to 1.75rem, 1.15, -0.02em): card and panel headings. Card names run at 1.5rem/800.
- **Lead** (400, clamp 1.0625rem to 1.3125rem, 1.55, ink-soft): one sentence under a heading, capped at 62ch.
- **Body** (400, 1rem, capped at 68ch, `text-wrap: pretty`).
- **Label / station** (700, 0.8125rem, +0.01em): diagram station names, sector captions. Tabular numerals for figures.

### Named Rules
**The Tight Display Rule.** Display never exceeds 6rem and tracking never goes below -0.04em; headings use `text-wrap: balance`.

## Layout

A single wrapper: max 80rem, fluid side gutters `clamp(1rem, 4vw, 2.5rem)`. Left-aligned composition; sections are separated by colour fields and route spines, not grey/white alternation. The sticky header is 64px on mobile and 72px at 1024px and up, with a 3px scroll-progress bar beneath it that takes the accent of the section under the header. Anchor scroll padding is 120px. Forms use a two-column split (form plus sticky 23.5rem to 26rem trip summary) from 1024px; below that the summary comes first. A `RouteSpine` runs down the page.

## Elevation & Depth

Flat and tonal: white panels on enamel, separated by 1px rules or 1px ring. Shadow is rare and structural.

### Shadow Vocabulary
- **Rule underline** (`0 1px 0 var(--color-rule)`): resting line card.
- **Open menu** (`0 18px 30px -18px rgba(11,27,58,0.28)`): header mega-panel.
- **Lift on hover** (`0 10px 28px -20px rgba(7,18,43,0.55)`): lineup card.
- **Preview frame** (`0 24px 48px -28px rgba(7,18,43,0.6)`): illustrative product previews.

### Named Rules
**The Soft Lift Rule.** Shadows are tinted with night navy, long blur and negative spread; no hard offset shadows.

## Shapes

Pills (full round) for every control: CTAs, tabs, chips, segmented control. Content panels 8px, menu rows 12px, focus outline radius 4px. Roundels are full circles carrying a one-letter glyph; stations are ringed dots (3px to 4px ring, white fill, filling with line colour when active). Lines are thick strokes bending at 45 degrees (octilinear). Hairline 1px rules throughout.

## Components

### Buttons
- **Shape:** full pill, 36/44/56px high (sm/md/lg), bold Figtree.
- **Primary:** ink fill, white text, with an arrow roundel (32px) in the current `--accent` at the trailing end. Hover to Night 2; the roundel nudges 2px and tilts -8 degrees; active drops 1px. On dark: white fill, ink text.
- **Secondary:** transparent, 2px inset ink ring, fills ink on hover (white-ring variant on dark).
- **Motion:** 300ms, `cubic-bezier(0.16, 1, 0.3, 1)`.

### Cards / Containers
- **Line card:** 8px radius white panel with a full `--accent` header band holding an inverted roundel, product name (display 800) and sector; pitch, bold benefit, then actions below a hairline.
- **Form panel:** 8px radius, 1px rule ring, 6px colour strip on top that takes the chosen line colour.

### Inputs / Fields
- **Style:** 48px high, 8px radius, white, 1px ink-mute (70%) border, 16px text.
- **Focus:** ink border plus 3px brand ring at 30%. Global focus-visible is a 3px accent outline at 3px offset.
- **Error:** border and message in error text colour, with an icon and message; a wash alert for server errors. Required marked with an asterisk, optional with "(facultatif)".
- **Choosers:** segmented pill control on enamel (selected = ink fill); line chips with a roundel that fills with the line colour when selected.

### Navigation
Desktop: a route bar. Hairline track under the nav items, ringed station per item (active = filled in the route colour, with the travelled distance drawn in colour), an ink "train" capsule that glides to the hovered item, mega-panels for Solutions (six roundel rows), Services and Formations. Primary CTA is the ink pill. Mobile: full-screen enamel panel with a vertical line of stations in rotating line colours, 30px display links.

### Signature: Network map and journey planner
Homepage hero: full-bleed octilinear SVG of lines, stations, interchanges, and the terminus; a journey planner dims other lines and opens a station board with that line's modules and a coloured demo CTA. Model in `src/lib/network.ts`. Product previews are labelled illustrative.

## Do's and Don'ts

### Do:
- **Do** scope `--accent` to one line per section or card and take text colour from `--on-accent`.
- **Do** build controls as full pills and panels at 8px radius with 1px rules.
- **Do** keep every reveal and animation inside the reduced-motion fallback (visible by default, JS opts in).
- **Do** reserve Night for contrast sections; use white text on it and `#c4d2ff` for secondary labels.
- **Do** pair every colour signal with text (line name, station label); keep 44px minimum touch targets.

### Don't:
- **Don't** use the legacy admin tokens (`--color-primary`, `--color-dark`, Inter) on public pages.
- **Don't** centre a hero over a row of equal icon cards, or alternate grey and white sections.
- **Don't** use emoji as icons; icons are Lucide strokes (2px) or the roundel glyphs.
- **Don't** use hard offset shadows or scatter line colours as decoration.
- **Don't** invent figures, clients or claims in diagrams or previews.

## Not canonized
Defects the build carries and are not rules: a hard-coded `#c4d2ff` and error hexes outside tokens; uppercase styling in `services/Terminus.tsx` (verify it is not a kicker); legacy duplicates of `--color-primary` in `:root`; shared `body` still declares Inter and a white background beneath `.site-root`.
