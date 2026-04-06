import { useOfflineQueue } from '../../store/offlineQueueStore'
import { fetchApi } from '../../lib/api'
import { useState } from 'react'
import { CloudOff, RefreshCw } from 'lucide-react'

export function EmergencyMode() {
  const { queue, clearQueue } = useOfflineQueue()
  const [syncing, setSyncing] = useState(false)

  if (queue.length === 0) return null

  const handleSync = async () => {
    setSyncing(true)
    try {
      // Re-play all offline logs sequentially to the backend
      for (const log of queue) {
        await fetchApi('/log', {
          method: 'POST',
          body: JSON.stringify({
            confirmed: log.confirmed,
            confidence: log.confidence,
            frames_sent: log.frames_sent
          })
        })
      }
      clearQueue()
      alert("Offline logs synced successfully! Refresh to see updated stats.")
    } catch (e: any) {
      alert("Sync failed: " + e.message)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="neo-card bg-[#F6FA70] border-[#FF0060] mt-2 !p-3">
      <div className="flex items-center gap-2 font-bold text-[#FF0060] mb-2">
        <CloudOff size={20} />
        <span>Offline Queue: {queue.length} un-synced drink{queue.length > 1 ? 's' : ''}</span>
      </div>
      <p className="text-xs mb-3 font-semibold">Your recent drinks couldn't reach the server. We saved them locally.</p>
      
      <button 
        onClick={handleSync}
        disabled={syncing || !navigator.onLine}
        className="neo-button w-full border-[#FF0060] text-sm !bg-white hover:!bg-gray-100 disabled:opacity-50"
      >
        <RefreshCw size={16} className={syncing ? "animate-spin" : ""} /> 
        {syncing ? 'Syncing...' : 'Sync Now'}
      </button>
    </div>
  )
}
