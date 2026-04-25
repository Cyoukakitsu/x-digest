// lib/ai.ts
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { generateText } from 'ai'
import { postsToText } from './rss'
import type { RssPost } from '@/types'

const MODEL = 'deepseek/deepseek-chat'

export function buildAccountPrompt(username: string, posts: RssPost[]): string {
  return `以下は@${username}の過去24時間のXポストです。重要な内容を3〜5文で日本語で要約してください。\n\n${postsToText(posts)}`
}

export function buildOverallPrompt(
  summaries: { username: string; summary: string }[]
): string {
  const content = summaries
    .map(s => `@${s.username}:\n${s.summary}`)
    .join('\n\n')
  return `以下は複数のXアカウントの今日のサマリーです。全体のハイライトを3〜5点の箇条書きで日本語でまとめてください。\n\n${content}`
}

export async function generateAccountSummary(
  username: string,
  posts: RssPost[]
): Promise<string> {
  const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY })
  const { text } = await generateText({
    model: openrouter(MODEL),
    prompt: buildAccountPrompt(username, posts),
  })
  return text
}

export async function generateOverallSummary(
  summaries: { username: string; summary: string }[]
): Promise<string> {
  const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY })
  const { text } = await generateText({
    model: openrouter(MODEL),
    prompt: buildOverallPrompt(summaries),
  })
  return text
}
