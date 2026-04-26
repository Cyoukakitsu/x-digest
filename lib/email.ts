// lib/email.ts
import { Resend } from 'resend'
import * as React from 'react'
import { DigestEmail } from '@/emails/digest-email'
import type { DigestWithEntries } from '@/types'

export async function sendDigestEmail(digest: DigestWithEntries): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL
  const to = process.env.RESEND_TO_EMAIL
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (!apiKey || !from || !to || !appUrl) {
    throw new Error(
      'Email env vars missing: RESEND_API_KEY, RESEND_FROM_EMAIL, RESEND_TO_EMAIL, NEXT_PUBLIC_APP_URL are all required'
    )
  }

  const resend = new Resend(apiKey)
  const { error } = await resend.emails.send({
    from,
    to,
    subject: `[x-digest] ${digest.date} のダイジェスト`,
    react: React.createElement(DigestEmail, { digest, appUrl }),
  })
  if (error) throw new Error(`Resend API error: ${error.message}`)
}
