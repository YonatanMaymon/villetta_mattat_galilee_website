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
- `npm run dev` and `npm run build` first run `scripts/images.mjs` (predev/prebuild), which resizes the
  photos. The first run on a fresh clone takes about two minutes; after that it only handles new or changed
  photos.

## Architecture

- **Frontend:** Vite, React 19, strict TypeScript, Tailwind v4 (tokens in `@theme` in `src/index.css`),
  react-router 7. `scripts/prerender.mjs` writes one static HTML file per page per language, plus sitemap,
  robots and 404. Adding an entry to `NAV_LINKS` (the menu) or `FOOTER_LINKS` (footer only) adds a
  prerendered page automatically. Also give it a `PAGE_SEO` entry and a `pageCopy` case in `src/seo/meta.ts`.
- **Photos:** `scripts/images.mjs` writes AVIF and WebP copies (480/960/1600 px) of each photo in
  `public/assets/` into `public/assets/img/`, plus the manifest `src/generated/images.json`. Both are
  git-ignored. Show photos with `<Picture sizes=...>` (`src/components/Picture.tsx`), not `<img>`; places
  that take one URL (a CSS background, a video poster) use `largestWebp()` (`src/lib/images.ts`).
  `public/assets/` is the only image folder. The prerender step fails without the manifest, and writes
  `dist/_headers` so browsers cache `/assets/img/*` for a year (each name carries a hash of its original).
- **i18n:** language comes from the URL (`src/i18n/paths.ts`). Page copy lives in `src/data/*.ts` (Hebrew,
  the source of truth) and `src/data/en/*.ts` (English overlays). UI labels live in `src/i18n/strings.ts`,
  where `en: Strings` is compile-checked against `he`. Components hold no copy: add every string in both
  languages.
- **SEO:** each page's Google title and description live in `src/data/seo.ts` (and `en/seo.ts`), written
  with the words people search for (צימר זוגי, ג'קוזי, סאונה, גליל); the page headings are separate.
  `src/seo/meta.ts` builds the head tags, plus JSON-LD on the home pages: `LodgingBusiness`, from the
  contact, price and social data, and on `/` only `WebSite`, which gives Google the site name. Never mark up
  the site's own testimonials as ratings: Google treats reviews a business publishes about itself as spam.
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

- Auth is HMAC (`X-API-Key`, `X-Timestamp`, `X-Nonce`, `X-Signature`). Smoobu switches the legacy `Api-Key`
  header off on 2026-09-25, so never use it.
- **Query strings must be percent-encoded in both the signature and the URL** (`apartments%5B%5D=`, not
  `apartments[]=`), or Smoobu answers 401 "Authentication required". Always use `encodeQuery()` in
  `server/smoobu.ts`; never build a query string by hand.
- A 401 on one endpoint while `/api/me` returns 200 means signing or encoding, not bad credentials.
- `POST /booking/checkApartmentAvailability` needs `SMOOBU_CUSTOMER_ID` and returns `prices: []` when the
  apartment has no nightly rates set.
- The `/price` table (`src/data/price.ts`) is typed in by hand and must match Smoobu's rates: 4,200 weekday,
  4,500 Friday/Saturday, 25% off 2 nights, 35% off 3+. After a rate change, compare with live
  `GET /api/quote` answers. Smoobu's quote is what guests are charged.
- To debug: write a throwaway script in the scratchpad that prints only status codes and field names.

## Conventions

- No semicolons, single quotes, 2-space indent, lines about 110 columns. One default-exported component per
  file, `Props` interface above it. Tailwind utilities inline, repeated class strings hoisted to consts,
  conditional classes via template literals (no clsx).
- RTL: use logical properties (`ps-`, `pe-`, `start-`, `text-start`), never left/right. Wrap phone numbers and
  references in `<bdi>` or set `dir`. Explicit `cursor-pointer` on every interactive element. Squared design:
  no `rounded-*` except circles. Icons from `lucide-react` (brand logos such as WhatsApp from `react-icons`).
- Accessibility: anything that moves by itself gets a pause button and starts paused under reduced motion
  (`useAutoplay` + `AutoplayToggle`); dialogs keep focus inside with `useFocusTrap`. The owner wants the
  pause buttons out of sight: they are invisible (`index.css`) until keyboard focus reaches them, or always
  shown once the visitor ticks the setting in the accessibility statement (`src/lib/pauseButtons.ts`, saved
  in localStorage). Don't hide them from the keyboard or screen readers (`display: none`, `visibility`,
  `aria-hidden`): that would leave no way to stop the motion (WCAG 2.2.2). The accessibility statement
  (`src/data/legal.ts`) describes all this, so keep it true when changing it.
- Comments explain why, in plain language. No non-null assertions; narrow the value instead.

## Secrets

- Values live in `.env.local` (Vite/Node), `.dev.vars` (wrangler dev) and Cloudflare secrets
  (`wrangler secret put`). All are gitignored except `.env.example`.
- **Never print, log or commit a value.** When debugging, print only lengths, booleans or status codes.
- Git history is clean: an old stash and unpushed commits that held real credentials were purged from the
  owner's clone on 2026-09-20. If a credential ever does reach a commit, treat it as leaked and rotate it.
- `VITE_TURNSTILE_SITE_KEY` is public and baked in at build time from the committed `.env.production`;
  `TURNSTILE_SECRET` is a Worker secret. Tokens carry the action `TURNSTILE_ACTION` (`shared/reservation.ts`),
  which the server checks, and are single-use, so the dialog remounts the widget after a failed attempt.

## Status and open items

- **Hosting:** everything on Cloudflare Workers, on `mattat-galilee.co.il` (DNS at Cloudflare).
- **Email:** Resend, sending from the verified subdomain `updates.mattat-galilee.co.il`. Setting
  `RESEND_API_KEY`, `MAIL_FROM` and `NOTIFY_TO_EMAIL` turns email on in both the Node server and the Worker;
  without all three, mail is only logged via `server/logMail.ts` (on Cloudflare: `wrangler tail`).
- **Owner tasks:** set the Smoobu weekend rate to 4,500 (it charges 4,536, +8%). In Search Console, submit
  `/sitemap.xml` and request indexing of the home page (search results still showed old-site pages in
  September 2026). Set up a Google Business Profile, where the map results for "צימר במתת" come from, and
  ask guests for Google reviews there. Have a lawyer check the accessibility statement and the privacy
  policy.
- **Accessibility and privacy:** the statement is at `/accessibility`, the policy at `/privacy` (copy in
  `src/data/legal.ts`), both linked from the footer. The floating accessibility button links to the
  statement. The booking and contact forms each carry a line linking to the policy. The policy names the
  services that receive guest data (Smoobu, Resend, Cloudflare); update it when that changes. The only thing
  the site keeps in the browser is the pause-button setting, which the policy mentions. The villa's own
  accessibility is described only as "partly accessible, call us": the owner gives details by phone.
- **Analytics:** Cloudflare Web Analytics with automatic setup: Cloudflare adds its script (cookieless, with
  single-page navigation tracking) to the pages at the edge, so the code has none. Don't add the snippet by
  hand as well, or it would load twice. Numbers: Cloudflare dashboard > Analytics > Web analytics.
- **WhatsApp:** a floating button (`WhatsAppButton`) and a column on `/contact`, both from `WHATSAPP_HREF`,
  which is derived from `PHONE_HREF`.
- **Domain:** `mattat-galilee.co.il` is served by the Worker (www redirects to it). `VITE_SITE_URL` is set
  in the committed `.env.production`; the build fails if it is missing, rather than shipping example.com.
- **Redirects:** the build writes `dist/_redirects` (Cloudflare static assets): 301 from each page's
  trailing-slash address to the canonical one without it, plus the press page's pre-redesign Hebrew address
  (`/כתבו-עלינו/`, since outside articles may link to it). No other old addresses are redirected.
- **Not done yet:** a payment processor for the card deposit.

## Working notes

- Windows with Git Bash. Node 24. Scripts run through `tsx`.
- Writing `\n` through a Python heredoc can turn into a real newline inside a string literal; check the file
  after such an edit, or use the Edit tool.
- `main` is updated by pull requests merged on GitHub. Start every new change on a new branch off an
  up-to-date `main`, unless the owner names a branch to use. Commit or push only when the owner asks.
