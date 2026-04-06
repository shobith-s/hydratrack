import { useCallback } from 'react'
import { fetchApi } from '../lib/api'

// Helper to convert base64 to Uint8Array for PushManager
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function usePush() {
  const subscribeToPush = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push not supported')
      return false
    }

    try {
      const registration = await navigator.serviceWorker.ready
      let subscription = await registration.pushManager.getSubscription()

      if (!subscription) {
        const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
        if (!publicVapidKey) {
          console.error("Vapid Key missing")
          return false
        }
        
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
        })
      }

      // Send to backend
      await fetchApi('/subscribe', {
        method: 'POST',
        body: JSON.stringify({ subscription_json: subscription.toJSON() })
      })

      return true
    } catch (err) {
      console.error('Push subscription failed', err)
      return false
    }
  }, [])

  return { subscribeToPush }
}
