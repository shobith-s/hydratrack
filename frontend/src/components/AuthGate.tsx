import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, initialized } = useAuthStore()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  if (!initialized) {
    return <div className="p-8 font-bold">Loading...</div>
  }

  if (session) {
    return <>{children}</>
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    setMessage('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin
      }
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Check your email for the magic link!')
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="neo-card max-w-sm w-full font-bold">
        <h1 className="text-2xl mb-4 text-center">HydroTrack 💧</h1>
        <p className="mb-6 text-sm text-center">Sign in to track your water intake and verify drinks with AI.</p>
        
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input 
            type="email" 
            placeholder="Your email address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="neo-input"
            required
            disabled={loading}
          />
          <button type="submit" className="neo-button primary w-full" disabled={loading}>
            {loading ? 'Sending...' : 'Send Magic Link'}
          </button>
        </form>

        {message && (
          <div className="mt-4 p-3 bg-white neo-border text-sm text-center">
            {message}
          </div>
        )}
      </div>
    </div>
  )
}
