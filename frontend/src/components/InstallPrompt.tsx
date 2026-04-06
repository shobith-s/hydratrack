import { useEffect, useState } from 'react'

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShow(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShow(false)
    }
    setDeferredPrompt(null)
  }

  if (!show) return null

  return (
    <div className="fixed top-0 left-0 w-full z-50 p-4 animate-in slide-in-from-top duration-300">
      <div className="neo-card bg-[#F6FA70] flex items-center justify-between shadow-md">
        <div className="flex flex-col">
          <span className="font-bold text-lg">Install HydroTrack 💧</span>
          <span className="text-sm">For the best native experience.</span>
        </div>
        <button className="neo-button primary p-2 text-sm" onClick={handleInstall}>
          Install App
        </button>
      </div>
    </div>
  )
}
