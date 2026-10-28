import type { IsoDate } from '../shared/dates'
import type { Lang } from '../shared/reservation'

/**
 * Cardcom (API v11, "Low Profile"): the guest types their card into Cardcom's own hosted page, shown in an
 * iframe in the booking dialog, so no card number ever reaches this code. The page runs `CreateTokenOnly`
 * with a J2 check: Cardcom confirms the card is real and keeps a token for it, and nothing is charged or
 * held. The owner charges that token later (deposit, damage, late cancellation) from the Cardcom dashboard.
 */

const BASE_URL = 'https://secure.cardcom.solutions'
const TIMEOUT_MS = 10_000
/** J2: check the card only. J5 would also freeze the amount on the guest's credit line. */
const J2 = 2
const ILS = 1

/** Cardcom could not be reached, or refused our request (bad credentials, bad field). */
export class PaymentUnavailableError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PaymentUnavailableError'
  }
}

export interface CardcomConfig {
  terminalNumber: number
  apiName: string
  baseUrl?: string
}

export interface CardPageRequest {
  ref: string
  arrival: IsoDate
  departure: IsoDate
  /** The stay's price. Shown on Cardcom's page and recorded with the token; with J2 nothing is charged. */
  amount: number
  lang: Lang
  name: string
  email: string
  phone: string
  successUrl: string
  failedUrl: string
  webhookUrl: string
}

/** What we stored in `ReturnValue`, read back from Cardcom (so it can be trusted, unlike a webhook body). */
export interface BookingTag {
  ref: string
  arrival: IsoDate
  departure: IsoDate
}

export type CardResult =
  | { saved: true; booking: BookingTag; cardOwner: string; expiry: string }
  | { saved: false }

export interface CardVault {
  /** Opens a one-time card page for the booking. Returns the address to show in the iframe. */
  createCardPage(request: CardPageRequest): Promise<{ lowProfileId: string; url: string }>
  /** Cardcom's own record of a card page: whether a token was saved, and for which booking. */
  getResult(lowProfileId: string): Promise<CardResult>
}

/** The booking travels through Cardcom in `ReturnValue` (250 characters at most), as `ref arrival departure`. */
export const encodeTag = ({ ref, arrival, departure }: BookingTag) => `${ref} ${arrival} ${departure}`

export function decodeTag(value: unknown): BookingTag | null {
  if (typeof value !== 'string') return null
  const [ref, arrival, departure, ...rest] = value.split(' ')
  if (!ref || !arrival || !departure || rest.length) return null
  return { ref, arrival, departure }
}

export function createCardcomClient(config: CardcomConfig, deps: { fetch?: typeof fetch } = {}): CardVault {
  const fetchImpl = deps.fetch ?? fetch
  const baseUrl = config.baseUrl ?? BASE_URL
  const auth = { TerminalNumber: config.terminalNumber, ApiName: config.apiName }

  async function call(path: string, body: Record<string, unknown>): Promise<Record<string, unknown>> {
    let response: Response
    try {
      response = await fetchImpl(`${baseUrl}${path}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ ...auth, ...body }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
    } catch {
      throw new PaymentUnavailableError('Could not reach Cardcom')
    }
    const json = (await response.json().catch(() => null)) as Record<string, unknown> | null
    if (!response.ok || !json) throw new PaymentUnavailableError(`Cardcom answered ${response.status}`)
    // Cardcom answers 200 even for errors; ResponseCode 0 is the only success.
    if (json.ResponseCode !== 0) throw new PaymentUnavailableError(`Cardcom ResponseCode ${String(json.ResponseCode)}`)
    return json
  }

  return {
    async createCardPage(request) {
      const he = request.lang === 'he'
      const json = await call('/api/v11/LowProfile/Create', {
        Operation: 'CreateTokenOnly',
        ReturnValue: encodeTag(request),
        Amount: request.amount,
        ISOCoinId: ILS,
        Language: request.lang,
        ProductName: he
          ? `שמירת כרטיס להזמנה ${request.ref}. לא יבוצע חיוב כעת.`
          : `Card on file for booking ${request.ref}. Nothing is charged now.`,
        SuccessRedirectUrl: request.successUrl,
        FailedRedirectUrl: request.failedUrl,
        CancelRedirectUrl: request.failedUrl,
        WebHookUrl: request.webhookUrl,
        UIDefinition: {
          // Cardcom caps these at 50 characters.
          CardOwnerNameValue: request.name.slice(0, 50),
          CardOwnerEmailValue: request.email.slice(0, 50),
          CardOwnerPhoneValue: request.phone.slice(0, 50),
        },
        AdvancedDefinition: { JValidateType: J2 },
      })
      const { LowProfileId: lowProfileId, Url: url } = json
      if (typeof lowProfileId !== 'string' || typeof url !== 'string' || !url.startsWith('https://')) {
        throw new PaymentUnavailableError('Cardcom returned no card page')
      }
      return { lowProfileId, url }
    },

    async getResult(lowProfileId) {
      let json: Record<string, unknown>
      try {
        json = await call('/api/v11/LowProfile/GetLpResult', { LowProfileId: lowProfileId })
      } catch (error) {
        // A page the guest never finished also comes back with a non-zero code: that is "no card", not an outage.
        if (error instanceof PaymentUnavailableError && error.message.startsWith('Cardcom ResponseCode')) {
          return { saved: false }
        }
        throw error
      }
      const token = json.TokenInfo as { Token?: unknown; CardMonth?: unknown; CardYear?: unknown } | null
      const booking = decodeTag(json.ReturnValue)
      if (typeof token?.Token !== 'string' || !token.Token || !booking) {
        return { saved: false }
      }
      const ui = json.UIValues as { CardOwnerName?: unknown } | null
      return {
        saved: true,
        booking,
        cardOwner: typeof ui?.CardOwnerName === 'string' ? ui.CardOwnerName : '',
        expiry: `${String(token.CardMonth).padStart(2, '0')}/${String(token.CardYear)}`,
      }
    },
  }
}
