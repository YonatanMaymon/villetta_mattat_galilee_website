import type { Mailer } from './mail'

/**
 * Stands in for the mail provider while Resend is not configured: every email is written to the log
 * instead of being sent, so nothing is lost silently. On Cloudflare these lines appear in `wrangler tail`.
 *
 * Setting RESEND_API_KEY, MAIL_FROM and NOTIFY_TO_EMAIL replaces this with the real mailer, with no
 * code change (see createServices in ./app).
 */
export const logMail: Mailer = async (mail) => {
  console.log(
    [
      '--- email (not sent: no RESEND_API_KEY) ---',
      `to: ${mail.to ?? 'owner'}`,
      `subject: ${mail.subject}`,
      mail.text,
      '---',
    ].join('\n'),
  )
}
