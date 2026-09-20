# Villetta: project notes

Marketing site and online booking for a villa (Villetta Mattat Galilee). Hebrew-first (RTL), English under
`/en`. Guests pick free dates in a popup; the request lands in the owner's Smoobu calendar for the owner
(Sharon) to confirm by phone.

## Commands

- `npm run dev`: site (Vite, :5173) and API (Node, :8787) together; Vite proxies `/api`.
- `npm run dev:api` / `npm start`: API only. With no Smoobu credentials it serves an in-memory DEMO calendar.
- `npm run dev:worker`: build, then `wrangler dev`. Site and API on one origin, like production. Reads `.dev.vars`.
- `npm run check:live`: read-only check of the real Smoobu / iCal / Resend credentials. Run it after any change
  to `server/smoobu.ts`. `-- --email you@example.com` sends one test email.
- `npm test` (vitest), `npm run typecheck`, `npm run build` (tsc, client, SSR, prerender), `npm run deploy`.

## Architecture

- **Frontend:** Vite, React 19, strict TypeScript, Tailwind v4 (tokens in `@theme` in `src/index.css`),
  react-router 7. `scripts/prerender.mjs` writes one static HTML file per page per language, plus sitemap,
  robots and 404. Adding an entry to `NAV_LINKS` adds a prerendered page automatically.
- **i18n:** language comes from the URL (`src/i18n/paths.ts`). Page copy lives in `src/data/*.ts` (Hebrew,
  the source of truth) and `src/data/en/*.ts` (English overlays). UI labels live in `src/i18n/strings.ts`,
  where `en: Strings` is compile-checked against `he`. Components hold no copy: add every string in both
  languages.
- **Booking API:** `server/` (Hono, runtime-agnostic) with two entries: `server/index.ts` (Node, local) and
  `worker/index.ts` (Cloudflare Worker: `/api/*` here, everything else served from `dist/` as static assets).
  Routes: `GET /api/availability`, `GET /api/quote`, `POST /api/booking`, `POST /api/contact`. `shared/` holds
  code used by both browser and server.
- **No database.** Smoobu is the only source of truth. Availability is cached 10 minutes in memory, cleared
  after a booking; `POST /api/booking` re-checks uncached.
- **Worker vs Node:** the Worker has no demo fallback, so missing secrets mean a 503 and the popup offers the
  phone. Never show invented availability on a deployed site.

## Booking flow (`src/components/BookingModal.tsx`)

Three steps with `StepIndicator`: dates (calendar, lazy-loaded) -> details -> confirm.

- **Step 3 is review only. No card capture, and no card fields.** There is no payment processor. Do not add
  card inputs that do not go to a processor's hosted iframe. The intended path is Cardcom `CreateTokenOnly`;
  the earlier working Cardcom code is at git tag `prior-booking`.
- The reservation is created in Smoobu on confirm, flagged in its `notice` (`PENDING_NOTICE`, because the
  API has no "unconfirmed" field) with `priceStatus: 0`. The flag only labels it; nothing releases it.
- The price is Smoobu's quote, decided server-side, never taken from the browser. Totals can be fractional:
  format with `formatShekels` (`shared/money.ts`).
- Abuse protection: honeypot field `website`, 3 bookings/hour per IP (in memory, per instance), Cloudflare
  Turnstile (skipped when `TURNSTILE_SECRET` is unset). A booking blocks real dates, so keep these.

## Smoobu gotchas

- Auth is HMAC (`X-API-Key`, `X-Timestamp`, `X-Nonce`, `X-Signature`). The legacy `Api-Key` header was
  switched off on 2026-09-25.
- **Query strings must be percent-encoded in both the signature and the URL** (`apartments%5B%5D=`, not
  `apartments[]=`), or Smoobu answers 401 "Authentication required". Always use `encodeQuery()` in
  `server/smoobu.ts`; never build a query string by hand.
- A 401 on one endpoint while `/api/me` returns 200 means signing or encoding, not bad credentials.
- `POST /booking/checkApartmentAvailability` needs `SMOOBU_CUSTOMER_ID` and returns `prices: []` when the
  apartment has no nightly rates set.
- Smoobu's totals do not equal the `/price` page table (e.g. 2 midweek nights: Smoobu 7,560 vs page 6,400).
  The owner chose to show Smoobu's numbers.
- To debug: write a throwaway script in the scratchpad that prints only status codes and field names.

## Conventions

- No semicolons, single quotes, 2-space indent, lines about 110 columns. One default-exported component per
  file, `Props` interface above it. Tailwind utilities inline, repeated class strings hoisted to consts,
  conditional classes via template literals (no clsx).
- RTL: use logical properties (`ps-`, `pe-`, `start-`, `text-start`), never left/right. Wrap phone numbers and
  references in `<bdi>` or set `dir`. Explicit `cursor-pointer` on every interactive element. Squared design:
  no `rounded-*` except circles. Icons from `lucide-react`.
- Comments explain why, in plain language. No non-null assertions; narrow the value instead.

## Secrets

- Values live in `.env.local` (Vite/Node), `.dev.vars` (wrangler dev) and Cloudflare secrets
  (`wrangler secret put`). All are gitignored except `.env.example`.
- **Never print, log or commit a value.** When debugging, print only lengths, booleans or status codes.
- The local `git stash` and the unpushed commits behind it hold OLD real credentials (an iCal secret and a
  Resend key). Do not run `git stash show -p` or `git log -p --all` and echo the output.
- `VITE_TURNSTILE_SITE_KEY` is public and baked in at build time; `TURNSTILE_SECRET` is a Worker secret.

## Status and open items

- **Hosting:** everything on Cloudflare Workers. Deploy first to the free `*.workers.dev` address. A custom
  domain later means moving its nameservers to Cloudflare: copy every existing DNS record first, above all
  MX, SPF and DKIM, or email on the domain stops working.
- **Email:** Resend is on hold (a domain problem). Mail is logged via `server/logMail.ts`; the owner watches
  Smoobu. Setting `RESEND_API_KEY`, `MAIL_FROM` and `NOTIFY_TO_EMAIL` turns email on with no code change.
- **Owner tasks:** update `/price` (`src/data/price.ts`) to match Smoobu; replace the placeholder
  cancellation text `BOOKING.terms` (`TODO(owner)`, both languages); set the real `VITE_SITE_URL` (the build
  warns and uses example.com without it); create Turnstile keys; fill the two ids in `wrangler.toml`.
- **Not done yet:** a privacy notice on the booking form; a payment processor for the card deposit.

## Working notes

- Windows with Git Bash. Node 24. Scripts run through `tsx`.
- Writing `\n` through a Python heredoc can turn into a real newline inside a string literal; check the file
  after such an edit, or use the Edit tool.
- `main` is updated by pull requests merged on GitHub. Work on a feature branch, and commit or push only when
  the owner asks.
