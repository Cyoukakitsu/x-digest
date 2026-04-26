// app/api/digest/run/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { validateSecret, runDigestPipeline } from '@/lib/pipeline'

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || !validateSecret(cronSecret, secret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await runDigestPipeline()

    if (result.error === 'duplicate') {
      return NextResponse.json(
        { error: 'Digest already exists for today' },
        { status: 409 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('[digest/run] Pipeline error:', error)
    return NextResponse.json(
      { error: 'Pipeline failed', message: String(error) },
      { status: 500 }
    )
  }
}
