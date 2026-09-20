import type { Env } from './env'

export class MailError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'MailError'
  }
}

export interface OutgoingMail {
  subject: string
  html: string
  text: string
  /** The guest's address, so "Reply" in the owner's inbox answers the guest. */
  replyTo?: string
  /** Overrides the default recipient (the owner); used for emails sent to the guest. */
  to?: string
}

/** Sends mail to the owner through Resend's HTTP API (plain fetch, so it runs on any host). */
export function createMailer(env: Env, fetchImpl: typeof fetch = fetch) {
  return async function send(mail: OutgoingMail): Promise<void> {
    const { RESEND_API_KEY: apiKey, NOTIFY_TO_EMAIL: to, MAIL_FROM: from } = env
    if (!apiKey || !to || !from) throw new MailError('Email is not configured')

    let response: Response
    try {
      response = await fetchImpl('https://api.resend.com/emails', {
        method: 'POST',
        headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          from,
          to: [mail.to ?? to],
          subject: mail.subject,
          html: mail.html,
          text: mail.text,
          ...(mail.replyTo ? { reply_to: mail.replyTo } : {}),
        }),
        signal: AbortSignal.timeout(10_000),
      })
    } catch {
      throw new MailError('Could not reach the email service')
    }
    if (!response.ok) throw new MailError(`Email service answered ${response.status}`)
  }
}

export type Mailer = ReturnType<typeof createMailer>
