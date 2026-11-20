# Form submission measurement

Only successfully persisted or transmitted submissions are confirmed. A submission is not a qualified lead or a sale. Honeypots, rejected requests and forwarded:false never count. Existing form handling succeeds independently of Mission Control availability.

Configure MC_SEO_BUSINESS_SOURCE_ID and MC_SEO_BUSINESS_TOKEN (43 characters) only in the server environment. The token is scoped to this site's FORM_SUBMISSIONS source. The destination origin is fixed to https://dashboard.allianceconsultants.net. MC_SEO_BUSINESS_OUTBOX_DIR points to the persistent volume /app/data/seo-business-outbox. No token is baked into the image or returned to the browser.

Preparation is persisted before the main sink. Only its confirmed success makes the event deliverable. Prepared records interrupted around a sink operation remain unconfirmed; they are not retried against the original sink. Confirmed events are delivered every minute with an exclusive lease and a two-second timeout. They survive process restarts and are removed only after an exact accepted/duplicate acknowledgement. Source changes and events older than 90 days are quarantined rather than replayed. Storage is bounded at 10,000 records.

Only opaque hashed identifiers, timestamps, a safe local page path, explicit supported locale (where supplied) and a transiently derived device class are sent. Names, emails, telephone numbers, messages, IPs and raw user agents are excluded. Country is not inferred. No daily completeness is claimed: a filesystem outbox cannot prove transactionality with an external provider. Missing submissions and days without coverage remain insufficient data, never a fabricated zero.

GET /api/seo-business-status requires the same server-side scoped Bearer token and returns counts and delivery state without events or secrets. Without a token it returns 401. Never create a fake production submission to test this integration. Run the isolated regression tests with node --test scripts/test-seo-business-outbox.mjs scripts/test-seo-business-hooks.mjs.
