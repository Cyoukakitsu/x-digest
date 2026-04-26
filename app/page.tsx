import { createServerClient } from '@/lib/supabase'
import { DigestView } from '@/components/digest-view'
import type { DigestWithEntries } from '@/types'

export const revalidate = 3600

export default async function HomePage() {
  const supabase = createServerClient()
  const { data: digest } = await supabase
    .from('digests')
    .select('*, digest_entries(*, x_accounts(*))')
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!digest) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">まだダイジェストがありません。</p>
        <p className="text-slate-400 text-sm mt-2">
          <a href="/admin" className="underline">管理ページ</a>からアカウントを追加して実行してください。
        </p>
      </div>
    )
  }

  return <DigestView digest={digest as DigestWithEntries} />
}
