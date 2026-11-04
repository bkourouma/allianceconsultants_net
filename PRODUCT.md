# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary visitor (confirmed): decision-makers — directors (DG), digital-transformation leads and IT heads (DSI) at companies, public administrations, hospitals/clinics, schools, banks/insurers and real-estate agencies in francophone Africa (focus Côte d'Ivoire / West Africa), choosing a SaaS vendor or integrator. Secondary audiences: archive/GED managers, training managers and learners, people wanting to automate a business process.

## Product Purpose

Alliance Consultants (Alliance Computer Consultants), founded 2003 in Abidjan, is an African publisher and integrator of vertical SaaS, AI-augmented business processes, and training. The site must make a decision-maker understand the offer, trust the company, and request a demo / contact. Success = qualified demo and contact requests per solution.

## Positioning

An African publisher (not a reseller) with 20+ years of local presence, six own-built vertical products, local support, and a training arm — a combination a foreign SaaS vendor cannot truthfully claim.

## Operating Context

French only, vouvoiement. Primary CTA across the site: "Demander une démo" (to /contact-demo with intent/from/block params). WhatsApp and phone are real contact channels in this market. Bandwidth and mid-range Android devices matter: mobile-first, fast.

## Capabilities and Constraints

- Stack (existing): Next.js 15 App Router, React 19, TypeScript strict, Tailwind 4, MDX/JSON content in `content/` validated by `scripts/validate-content.ts` at build, Prisma/Postgres, Docker deploy. Redesign keeps this stack and all routes.
- Public routes in scope: `/`, `/solutions[/slug]`, `/services[/slug]`, `/formations[/slug]`, `/references[/id]`, `/blog[/slug|/tags/slug]`, `/a-propos`, `/contact-demo`, `/contact-recu`, `/contact-erreur`, `/privacy`. `/admin/*` and `/api/*` are out of scope.
- Content/data shape and component props driven by Zod schemas must keep working; SEO (single H1, meta, JSON-LD), Umami tracking, forms (react-hook-form) must keep working.
- Forbidden strings: "Edit Template", "Get Consultation Now", "Lorem ipsum", "Institut Froebel", "Submit Form", "Your Name Here", "TODO:", "FIXME:". Forbidden unsubstantiated claims: "certifié médical", "agréé MDR", "conforme CE", "licence d'agence immobilière", "agréé OHADA".
- Performance budget: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1; scripts kept light.
- Six solutions: DocuPro Suite (GED), MedicPro V11 (pharma regulatory — not "medical"), CliniquePro (ophthalmology clinic management), ImmoTopia.cloud (real-estate SaaS), Immo-Annonces.fr (real-estate marketplace, Côte d'Ivoire), École Digitale (school management / training hub). Five services (custom dev, AI process automation, AMOA, dematerialisation, professional scanners). Six trainings (AI for business, web & AI .NET/React, n8n automation, SQL Server, GED & archiving, agile digital project mgmt).

## Brand Commitments

Name "Alliance Consultants". Logo (`public/images/Logo_AllianceConsultants.png`): isometric cube forming "A" and "C" in navy and vivid blue, wordmark "Alliance / Computer / Consultants" — binding, keep as is. The AI assistant widget ("Une question ?", `src/components/assistant/`, feature 003) is binding: it stays, restyled to fit the new world.
Direction history: a first redesign ("RÉSEAU", a transit-network map world, shipped Oct 2026) was judged by the user as **too technical / busy** and **not premium enough**. It is now the anti-reference: the new world must read as established, premium and calm, instantly understandable by a non-technical decision-maker, while keeping the brief's modern, elegant, professional, fun and interactive qualities. The look is otherwise not binding; all content and routes are.

## Evidence on Hand

Real: founded 2003 in Abidjan; six products with feature docs in `docs/`; contact details in `content/site-settings.json`; social profiles. Client references are database-driven (published ProjectReferences) and may be empty.
Not validated — do NOT present as fact without a "to confirm" marker or removal: "100+ projets", "8 pays", "dizaines de clients", "+40 % de productivité", "x10 plus vite", "60–80 %" task reduction, "Certifié & Sécurisé", "Hébergement souverain", training durations/prices/programmes, timeline years beyond 2003 (homepage and à-propos disagree). Never invent client names, logos or testimonials. Synthetic demonstration UI is allowed when labelled as illustrative.

## Product Principles

1. Prove the product, don't describe it: show the six solutions as working interfaces.
2. Rooted in Abidjan and francophone Africa without cliché (no savannah/sunset stock tropes).
3. One clear action per section; demo request is never more than a scroll away.
4. Credibility over hype: no unverified numbers; honest, specific copy.
5. Fast on real African networks and devices.

## Accessibility & Inclusion

WCAG 2.2 AA: keyboard navigation, visible focus, labelled forms, `prefers-reduced-motion` respected (all interactive/animated flourishes must degrade gracefully), no duplicated menu in DOM, Lighthouse a11y ≥ 90.
