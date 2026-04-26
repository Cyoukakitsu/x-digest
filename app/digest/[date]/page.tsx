// app/digest/[date]/page.tsx
import { createServerClient } from '@/lib/supabase'
import { DigestView } from '@/components/digest-view'
import { notFound } from 'next/navigation'
import type { DigestWithEntries } from '@/types'

interface PageProps {
  params: Promise<{ date: string }>
}

export default async function DigestPage({ params }: PageProps) {
  const { date } = await params
  const supabase = createServerClient()

  const { data: digest } = await supabase
    .from('digests')
    .select('*, digest_entries(*, x_accounts(*))')
    .eq('date', date)
    .maybeSingle()

  if (!digest) notFound()

  return <DigestView digest={digest as DigestWithEntries} />
}
