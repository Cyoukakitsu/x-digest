// components/digest-view.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { DigestWithEntries } from '@/types'

interface DigestViewProps {
  digest: DigestWithEntries
}

export function DigestView({ digest }: DigestViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500">{digest.date}</p>
        <h2 className="text-2xl font-bold text-slate-800 mt-1">今日のダイジェスト</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">全体ハイライト</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-700 whitespace-pre-line leading-relaxed text-sm">
            {digest.overall_summary}
          </p>
        </CardContent>
      </Card>

      <Separator />

      <div className="space-y-4">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          アカウント別サマリー
          <Badge variant="secondary">{digest.digest_entries.length}件</Badge>
        </h3>

        {digest.digest_entries.map(entry => (
          <Card key={entry.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">
                  @{entry.x_accounts.username}
                  {entry.x_accounts.display_name && (
                    <span className="font-normal text-slate-500 ml-1">
                      {entry.x_accounts.display_name}
                    </span>
                  )}
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {entry.post_count}件
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 text-sm whitespace-pre-line leading-relaxed">
                {entry.summary}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
