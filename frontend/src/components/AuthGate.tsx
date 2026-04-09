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
    <div className="app-container auth-view">
      <main className="app-main flex-center">
        <div className="neo-card" style={{ width: '100%' }}>
          <h1 className="result-title" style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '16px' }}>HydroTrack <span className="material-symbols-outlined" style={{color: 'var(--c-blue)'}}>water_drop</span></h1>
          <p style={{ fontWeight: 600, textAlign: 'center', marginBottom: '32px', fontSize: '14px' }}>Sign in to track your water intake and verify drinks with AI.</p>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input 
              type="email" 
              placeholder="Your email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="neo-input"
              required
              disabled={loading}
            />
            <button type="submit" className="neo-button-large neo-button-primary" disabled={loading}>
              {loading ? 'Sending...' : 'Send Magic Link'}
            </button>
          </form>

          {message && (
            <div className="mt-4 p-3 bg-white neo-border text-sm text-center">
              {message}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
