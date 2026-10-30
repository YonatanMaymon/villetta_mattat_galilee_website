import { describe, expect, it, vi } from 'vitest'
import { createCardcomClient, decodeTag, encodeTag, PaymentUnavailableError } from './cardcom'

const respond = (body: unknown, status = 200) => vi.fn(async () => new Response(JSON.stringify(body), { status }))

const client = (fetchImpl: ReturnType<typeof respond>) =>
  createCardcomClient({ terminalNumber: 1000, apiName: 'test-api' }, { fetch: fetchImpl as unknown as typeof fetch })

const PAGE = {
  ref: 'A1B2C3D4E5F6',
  arrival: '2026-11-10',
  departure: '2026-11-13',
  amount: 12600,
  lang: 'he' as const,
  name: 'Dana Ben David',
  email: 'dana@example.com',
  phone: '052-1234567',
  successUrl: 'https://site.example/api/payment/return?result=ok',
  failedUrl: 'https://site.example/api/payment/return?result=failed',
  webhookUrl: 'https://site.example/api/payment/webhook',
}

const sentBody = (fetchImpl: ReturnType<typeof respond>) => {
  const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit]
  return { url, body: JSON.parse(String(init.body)) }
}

describe('createCardPage', () => {
  it('asks for a J2 token-only page carrying the booking, and returns its address', async () => {
    const fetchImpl = respond({ ResponseCode: 0, LowProfileId: 'lp-1', Url: 'https://secure.cardcom.solutions/lp/1' })
    const page = await client(fetchImpl).createCardPage(PAGE)
    expect(page).toEqual({ lowProfileId: 'lp-1', url: 'https://secure.cardcom.solutions/lp/1' })

    const { url, body } = sentBody(fetchImpl)
    expect(url).toBe('https://secure.cardcom.solutions/api/v11/LowProfile/Create')
    expect(body).toMatchObject({
      TerminalNumber: 1000,
      ApiName: 'test-api',
      Operation: 'CreateTokenOnly',
      ReturnValue: 'A1B2C3D4E5F6 2026-11-10 2026-11-13 he',
      Amount: 12600,
      ISOCoinId: 1,
      Language: 'he',
      WebHookUrl: PAGE.webhookUrl,
      AdvancedDefinition: { JValidateType: 2 },
      UIDefinition: { CardOwnerNameValue: 'Dana Ben David' },
    })
  })

  it('treats a non-zero ResponseCode as a failure, though Cardcom answers 200', async () => {
    const fetchImpl = respond({ ResponseCode: 5033, Description: 'bad ApiName' })
    await expect(client(fetchImpl).createCardPage(PAGE)).rejects.toBeInstanceOf(PaymentUnavailableError)
  })

  it('treats an unreachable Cardcom as a failure', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError('network down')
    })
    await expect(client(fetchImpl as unknown as ReturnType<typeof respond>).createCardPage(PAGE)).rejects.toBeInstanceOf(
      PaymentUnavailableError,
    )
  })
})

describe('getResult', () => {
  it('reports a saved token with the booking read back from Cardcom', async () => {
    const fetchImpl = respond({
      ResponseCode: 0,
      ReturnValue: 'A1B2C3D4E5F6 2026-11-10 2026-11-13 en',
      Operation: 'CreateTokenOnly',
      TokenInfo: { Token: 'tok-123', CardMonth: 4, CardYear: 2029 },
      UIValues: { CardOwnerName: 'Dana Ben David', CardOwnerEmail: 'dana@example.com', CardOwnerPhone: '052-1234567' },
    })
    expect(await client(fetchImpl).getResult('lp-1')).toEqual({
      saved: true,
      booking: { ref: 'A1B2C3D4E5F6', arrival: '2026-11-10', departure: '2026-11-13', lang: 'en' },
      holder: { name: 'Dana Ben David', email: 'dana@example.com', phone: '052-1234567' },
      expiry: '04/2029',
    })
    expect(sentBody(fetchImpl).body).toMatchObject({ LowProfileId: 'lp-1', TerminalNumber: 1000 })
  })

  it('reports no card when the page was never completed', async () => {
    expect(await client(respond({ ResponseCode: 0, ReturnValue: 'X 2026-11-10 2026-11-13' })).getResult('lp')).toEqual({
      saved: false,
    })
    expect(await client(respond({ ResponseCode: 700 })).getResult('lp')).toEqual({ saved: false })
  })

  it('reports Cardcom being down as retryable rather than as "no card"', async () => {
    await expect(client(respond({}, 502)).getResult('lp')).rejects.toBeInstanceOf(PaymentUnavailableError)
  })
})

describe('booking tag', () => {
  it('round-trips, and rejects anything else', () => {
    const tag = { ref: 'ABC', arrival: '2026-11-10', departure: '2026-11-13', lang: 'he' as const }
    expect(decodeTag(encodeTag(tag))).toEqual(tag)
    expect(decodeTag('ABC 2026-11-10 2026-11-13')).toBeNull()
    expect(decodeTag('ABC 2026-11-10 2026-11-13 fr')).toBeNull()
    expect(decodeTag(42)).toBeNull()
  })
})
