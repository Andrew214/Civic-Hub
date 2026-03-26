import { createClient } from '@supabase/supabase-js'

// ─────────────────────────────────────────────────────────────
//  STEP 1: Go to https://supabase.com → New Project
//  STEP 2: Settings → API → copy your URL and anon key below
// ─────────────────────────────────────────────────────────────
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://YOUR_PROJECT.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ─── AUTH HELPERS ─────────────────────────────────────────────

export const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
      queryParams: { prompt: 'select_account' },
    },
  })
  if (error) throw error
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// ─── USER PROFILE HELPERS ────────────────────────────────────

export const upsertProfile = async ({ userId, email, name, avatar, zip }) => {
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, email, name, avatar_url: avatar, zip, updated_at: new Date().toISOString() })
  if (error) throw error
}

export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}
