/**
 * Configuration, supplied by the host (`.env.local` in development, real environment variables in
 * production). Never sent to the browser.
 *
 * Nothing here is required to run the site: with no values the API serves a demo calendar so the
 * booking dialog can be walked end to end before any Smoobu credentials exist.
 */
export interface Env {
  /** Smoobu "Individual iCal" export link. Read-only availability; the fallback while the API is not set up. */
  SMOOBU_ICAL_URL?: string
  /** Smoobu API key and secret (Settings > Advanced > API Keys). The key grants access to the whole account. */
  SMOOBU_API_KEY?: string
  SMOOBU_API_SECRET?: string
  /** The apartment to book, and (if Smoobu's availability endpoint needs it) the account's customer id. */
  SMOOBU_APARTMENT_ID?: string
  SMOOBU_CUSTOMER_ID?: string

  /** Point the client at another server (a mock, or a sandbox) instead of the real Smoobu. Testing only. */
  SMOOBU_BASE_URL?: string

  /** Resend API key used to send email. */
  RESEND_API_KEY?: string
  /** Where booking requests and contact messages are delivered. */
  NOTIFY_TO_EMAIL?: string
  /** Verified sender address, e.g. `Villetta <bookings@your-domain>`. */
  MAIL_FROM?: string
}
