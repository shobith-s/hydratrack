import { useLocation, useNavigate } from 'react-router-dom'
import { VerificationResult } from './VerificationResult'
import { useEffect } from 'react'

export function ResultScreen() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as { confirmed: boolean; confidence: number; offline?: boolean } | null

  useEffect(() => {
    if (!state) navigate('/', { replace: true })
  }, [state, navigate])

  if (!state) return null

  return (
    <VerificationResult
      confirmed={state.confirmed}
      confidence={state.confidence}
      offline={state.offline}
    />
  )
}
