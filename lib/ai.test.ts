// lib/ai.test.ts
import { describe, it, expect } from 'vitest'
import { buildAccountPrompt, buildOverallPrompt } from './ai'
import type { RssPost } from '@/types'

const now = new Date()
const samplePosts: RssPost[] = [
  { title: 'Post 1', content: 'Content 1', pubDate: now, link: 'https://x.com/1' },
  { title: 'Post 2', content: 'Content 2', pubDate: now, link: 'https://x.com/2' },
]

describe('buildAccountPrompt', () => {
  it('includes the username', () => {
    const prompt = buildAccountPrompt('testuser', samplePosts)
    expect(prompt).toContain('testuser')
  })

  it('includes post titles and content', () => {
    const prompt = buildAccountPrompt('testuser', samplePosts)
    expect(prompt).toContain('Post 1')
    expect(prompt).toContain('Content 1')
  })
})

describe('buildOverallPrompt', () => {
  it('includes all account summaries', () => {
    const summaries = [
      { username: 'user1', summary: 'Summary 1' },
      { username: 'user2', summary: 'Summary 2' },
    ]
    const prompt = buildOverallPrompt(summaries)
    expect(prompt).toContain('user1')
    expect(prompt).toContain('Summary 1')
    expect(prompt).toContain('user2')
    expect(prompt).toContain('Summary 2')
  })
})
