import { useState, useEffect } from 'react'

export function PermissionsGate({ children }: { children: React.ReactNode }) {
  const [granted, setGranted] = useState(false)
  const [asked, setAsked] = useState(false)

  useEffect(() => {
    if (Notification.permission === 'granted') {
      setGranted(true)
    }
  }, [])

  const handleRequest = async () => {
    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        setGranted(true)
      } else {
        alert('Push notifications are recommended to remind you to drink water! You can enable them later.')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setAsked(true)
    }
  }

  if (granted || asked) {
    return <>{children}</>
  }

  return (
    <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="neo-card max-w-sm w-full bg-white text-center">
        <h2 className="text-xl font-bold mb-4">Stay Hydrated! 💦</h2>
        <p className="mb-6">We'll send you hourly reminders to log your water intake. No spam, just hydration.</p>
        <div className="flex flex-col gap-3">
          <button className="neo-button primary w-full" onClick={handleRequest}>
            Enable Reminders
          </button>
          <button className="neo-button bg-gray-200 w-full" onClick={() => setAsked(true)}>
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  )
}
