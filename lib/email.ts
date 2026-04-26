// lib/email.ts
import { Resend } from 'resend'
import * as React from 'react'
import { DigestEmail } from '@/emails/digest-email'
import type { DigestWithEntries } from '@/types'

export async function sendDigestEmail(digest: DigestWithEntries): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY)

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: process.env.RESEND_TO_EMAIL!,
    subject: `[x-digest] ${digest.date} のダイジェスト`,
    react: React.createElement(DigestEmail, {
      digest,
      appUrl: process.env.NEXT_PUBLIC_APP_URL!,
    }),
  })
}
