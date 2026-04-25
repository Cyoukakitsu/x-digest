// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// Uses service role key — bypasses RLS. Only call from server-side code (API routes, Server Components).
export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      'Missing required Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY'
    )
  }
  return createClient(url, key)
}
