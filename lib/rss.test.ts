// lib/rss.test.ts
import { describe, it, expect } from 'vitest'
import { filterRecentPosts, postsToText } from './rss'
import type { RssPost } from '@/types'

const now = new Date()
const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000)
const twentyFiveHoursAgo = new Date(now.getTime() - 25 * 60 * 60 * 1000)

describe('filterRecentPosts', () => {
  it('keeps posts from the last 24 hours', () => {
    const posts: RssPost[] = [
      { title: 'New', content: 'content', pubDate: oneHourAgo, link: 'https://x.com/1' },
      { title: 'Old', content: 'content', pubDate: twentyFiveHoursAgo, link: 'https://x.com/2' },
    ]
    const result = filterRecentPosts(posts)
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('New')
  })

  it('returns empty array when all posts are older than 24 hours', () => {
    const posts: RssPost[] = [
      { title: 'Old', content: 'content', pubDate: twentyFiveHoursAgo, link: 'https://x.com/1' },
    ]
    expect(filterRecentPosts(posts)).toHaveLength(0)
  })

  it('returns empty array for empty input', () => {
    expect(filterRecentPosts([])).toHaveLength(0)
  })
})

describe('postsToText', () => {
  it('formats posts as numbered list with title and content', () => {
    const posts: RssPost[] = [
      { title: 'Hello', content: 'World', pubDate: oneHourAgo, link: 'https://x.com/1' },
      { title: 'Foo', content: 'Bar', pubDate: oneHourAgo, link: 'https://x.com/2' },
    ]
    const text = postsToText(posts)
    expect(text).toContain('1.')
    expect(text).toContain('Hello')
    expect(text).toContain('World')
    expect(text).toContain('2.')
    expect(text).toContain('Foo')
  })
})
