// lib/rss.ts
import Parser from 'rss-parser'
import type { RssPost } from '@/types'

const parser = new Parser()

export function filterRecentPosts(posts: RssPost[]): RssPost[] {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000)
  return posts.filter(p => p.pubDate > cutoff)
}

export function postsToText(posts: RssPost[]): string {
  return posts
    .map((p, i) => `${i + 1}. ${p.title}\n${p.content}`)
    .join('\n\n')
}

export async function fetchAccountPosts(rssUrl: string): Promise<RssPost[]> {
  const feed = await parser.parseURL(rssUrl)
  const posts: RssPost[] = feed.items
    .filter(item => item.pubDate != null)
    .map(item => ({
      title: item.title ?? '',
      content: item.contentSnippet ?? item.content ?? '',
      pubDate: new Date(item.pubDate!),
      link: item.link ?? '',
    }))
  return filterRecentPosts(posts)
}
