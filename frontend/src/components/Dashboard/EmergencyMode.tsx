import { useOfflineQueue } from '../../store/offlineQueueStore'
import { fetchApi } from '../../lib/api'
import { useState } from 'react'

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
    } catch (e: unknown) {
      alert("Sync failed: " + (e instanceof Error ? e.message : 'Unknown error'))
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="neo-card" style={{ backgroundColor: '#F6FA70', borderColor: 'var(--c-red)', padding: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 900, color: 'var(--c-red)', marginBottom: '8px' }}>
        <span className="material-symbols-outlined">cloud_off</span>
        <span>Offline Queue: {queue.length} un-synced drink{queue.length > 1 ? 's' : ''}</span>
      </div>
      <p style={{ fontSize: '12px', marginBottom: '12px', fontWeight: 600 }}>Your recent drinks couldn't reach the server. We saved them locally.</p>
      
      <button 
        onClick={handleSync}
        disabled={syncing || !navigator.onLine}
        className="neo-button-large"
        style={{ height: '40px', backgroundColor: 'var(--c-white)', borderColor: 'var(--c-red)', fontSize: '14px' }}
      >
        {syncing ? (
          <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>sync</span>
        ) : (
          <span className="material-symbols-outlined">refresh</span>
        )}
        <span style={{ marginLeft: '4px' }}>{syncing ? 'Syncing...' : 'Sync Now'}</span>
      </button>
    </div>
  )
}
