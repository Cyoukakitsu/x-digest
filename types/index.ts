// types/index.ts

export interface XAccount {
  id: string
  username: string
  display_name: string | null
  rss_url: string
  active: boolean
  created_at: string
}

export interface Digest {
  id: string
  date: string
  overall_summary: string
  created_at: string
}

export interface DigestEntry {
  id: string
  digest_id: string
  x_account_id: string
  summary: string
  post_count: number
  created_at: string
}

export interface DigestWithEntries extends Digest {
  digest_entries: (DigestEntry & {
    x_accounts: XAccount
  })[]
}

export interface RssPost {
  title: string
  content: string
  pubDate: Date
  link: string
}

export interface PipelineResult {
  success: boolean
  date: string
  accountsProcessed: number
  error?: string
}
