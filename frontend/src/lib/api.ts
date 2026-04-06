import { useAuthStore } from '../store/authStore'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7860'

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const session = useAuthStore.getState().session
  if (!session?.access_token) {
    throw new Error('No auth token available')
  }

  const headers = new Headers(options.headers)
  headers.set('Authorization', `Bearer ${session.access_token}`)
  
  // Only set Content-Type if not already explicitly empty or set
  // (We use this check because sometimes we might want to send FormData, though not used here)
  if (!options.headers || !Object.keys(options.headers).some(k => k.toLowerCase() === 'content-type')) {
      headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  })

  if (!res.ok) {
    let err
    try {
      err = await res.json()
    } catch {
      throw new Error(`API Request Failed: ${res.statusText}`)
    }
    throw new Error(err.detail || err.message || `API Error: ${res.status}`)
  }

  return res.json()
}
