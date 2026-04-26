// lib/pipeline.ts
import { createServerClient } from './supabase'
import { fetchAccountPosts } from './rss'
import { generateAccountSummary, generateOverallSummary } from './ai'
import { sendDigestEmail } from './email'
import type { XAccount, DigestWithEntries, PipelineResult, RssPost } from '@/types'

export function validateSecret(
  expected: string,
  provided: string | null
): boolean {
  if (!provided) return false
  return provided === expected
}

type FeedSuccess = { account: XAccount; posts: RssPost[] }

export async function runDigestPipeline(): Promise<PipelineResult> {
  const supabase = createServerClient()
  const today = new Date().toISOString().split('T')[0]

  // Duplicate check before any expensive calls
  const { data: existing } = await supabase
    .from('digests')
    .select('id')
    .eq('date', today)
    .maybeSingle()

  if (existing) {
    return { success: false, date: today, accountsProcessed: 0, error: 'duplicate' }
  }

  // Fetch active accounts
  const { data: accounts, error: accountsError } = await supabase
    .from('x_accounts')
    .select('*')
    .eq('active', true)

  if (accountsError || !accounts) {
    throw new Error(`Failed to fetch accounts: ${accountsError?.message}`)
  }

  // Fetch RSS feeds in parallel; skip accounts that fail
  const feedResults = await Promise.allSettled(
    (accounts as XAccount[]).map(async (account) => {
      const posts = await fetchAccountPosts(account.rss_url)
      return { account, posts } satisfies FeedSuccess
    })
  )

  const successfulFeeds = feedResults
    .filter((r): r is PromiseFulfilledResult<FeedSuccess> => r.status === 'fulfilled')
    .map(r => r.value)
    .filter(r => r.posts.length > 0)

  if (successfulFeeds.length === 0) {
    return { success: true, date: today, accountsProcessed: 0 }
  }

  // Generate per-account summaries
  const accountSummaries = await Promise.all(
    successfulFeeds.map(async ({ account, posts }) => ({
      account,
      summary: await generateAccountSummary(account.username, posts),
      postCount: posts.length,
    }))
  )

  // Generate overall summary
  const overallSummary = await generateOverallSummary(
    accountSummaries.map(s => ({ username: s.account.username, summary: s.summary }))
  )

  // Save digest
  const { data: digest, error: digestError } = await supabase
    .from('digests')
    .insert({ date: today, overall_summary: overallSummary })
    .select()
    .single()

  if (digestError || !digest) {
    throw new Error(`Failed to save digest: ${digestError?.message}`)
  }

  // Save per-account entries
  const { error: entriesError } = await supabase.from('digest_entries').insert(
    accountSummaries.map(s => ({
      digest_id: digest.id,
      x_account_id: s.account.id,
      summary: s.summary,
      post_count: s.postCount,
    }))
  )

  if (entriesError) {
    throw new Error(`Failed to save digest entries: ${entriesError.message}`)
  }

  // Fetch full digest with joined relations for email
  const { data: fullDigest } = await supabase
    .from('digests')
    .select('*, digest_entries(*, x_accounts(*))')
    .eq('id', digest.id)
    .single()

  await sendDigestEmail(fullDigest as DigestWithEntries)

  return { success: true, date: today, accountsProcessed: accountSummaries.length }
}
