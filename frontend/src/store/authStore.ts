import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthState {
  session: Session | null
  user: User | null
  initialized: boolean
  setSession: (session: Session | null) => void
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  initialized: false,
  setSession: (session) => set({ session, user: session?.user ?? null, initialized: true }),
  signOut: async () => {
    await supabase.auth.signOut()
    set({ session: null, user: null })
  }
}))

// Setup listener outside of component lifecycle 
// so auth state tracks continuously
supabase.auth.getSession().then(({ data: { session } }) => {
  useAuthStore.getState().setSession(session)
})

supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.getState().setSession(session)
})
