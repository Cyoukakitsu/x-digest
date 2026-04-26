// emails/digest-email.tsx
import * as React from 'react'
import type { DigestWithEntries } from '@/types'

interface DigestEmailProps {
  digest: DigestWithEntries
  appUrl: string
}

export function DigestEmail({ digest, appUrl }: DigestEmailProps) {
  const highlights = digest.overall_summary
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0)
    .slice(0, 5)

  return (
    <html>
      <body
        style={{
          fontFamily: 'sans-serif',
          maxWidth: '600px',
          margin: '0 auto',
          padding: '24px',
          color: '#1e293b',
        }}
      >
        <h2 style={{ color: '#1e3a8a', marginBottom: '4px' }}>
          {digest.date} のダイジェスト
        </h2>
        <p style={{ color: '#64748b', fontSize: '13px', marginTop: 0 }}>
          x-digest — 自動生成ダイジェスト
        </p>

        <hr style={{ borderColor: '#e2e8f0', margin: '16px 0' }} />

        <h3 style={{ marginBottom: '8px' }}>今日のハイライト</h3>
        <ul style={{ paddingLeft: '20px', lineHeight: '1.7' }}>
          {highlights.map((line, i) => (
            <li key={i}>{line.replace(/^[-•*]\s*/, '')}</li>
          ))}
        </ul>

        <hr style={{ borderColor: '#e2e8f0', margin: '16px 0' }} />

        <h3 style={{ marginBottom: '8px' }}>
          アカウント別サマリー（{digest.digest_entries.length}件）
        </h3>
        {digest.digest_entries.map(entry => (
          <p key={entry.id} style={{ margin: '6px 0', fontSize: '14px' }}>
            <strong>@{entry.x_accounts.username}</strong> —{' '}
            {entry.summary.split('\n')[0]}
          </p>
        ))}

        <hr style={{ borderColor: '#e2e8f0', margin: '16px 0' }} />

        <p>
          <a
            href={`${appUrl}/digest/${digest.date}`}
            style={{ color: '#1e3a8a', fontWeight: 'bold' }}
          >
            詳細を読む →
          </a>
        </p>
      </body>
    </html>
  )
}
