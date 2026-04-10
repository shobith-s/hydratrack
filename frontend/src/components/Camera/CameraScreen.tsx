import { useState, useCallback } from 'react'
import { VideoRecorder } from './VideoRecorder'
import { extractFrames } from './FrameExtractor'
import { fetchApi } from '../../lib/api'
import { useOfflineQueue } from '../../store/offlineQueueStore'
import { useNavigate } from 'react-router-dom'

export function CameraScreen() {
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [capturedFrames, setCapturedFrames] = useState<string[]>([])
  const addOfflineLog = useOfflineQueue(state => state.addLog)
  const navigate = useNavigate()

  const handleCapture = useCallback(async () => {
    if (!videoEl || analyzing) return
    setAnalyzing(true)
    setError(null)

    try {
      const frames = await extractFrames(videoEl, 3, 300)
      setCapturedFrames(frames)

      let confirmed = false
      let confidence = 0.0

      try {
        const verifyRes = await fetchApi('/verify', {
          method: 'POST',
          body: JSON.stringify({ frames })
        })
        confirmed = verifyRes.confirmed
        confidence = verifyRes.confidence
      } catch (apiErr: unknown) {
        const msg = apiErr instanceof Error ? apiErr.message : ''
        if (msg.includes('Failed to fetch') || !navigator.onLine) {
          addOfflineLog({
            confirmed: true,
            confidence: 1.0,
            frames_sent: frames.length
          })
          navigate('/result', { state: { confirmed: true, confidence: 1.0, offline: true } })
          return
        } else {
          throw apiErr
        }
      }

      await fetchApi('/log', {
        method: 'POST',
        body: JSON.stringify({ confirmed, confidence, frames_sent: frames.length })
      })

      navigate('/result', { state: { confirmed, confidence } })

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to capture or verify.')
    } finally {
      setAnalyzing(false)
    }
  }, [videoEl, analyzing, addOfflineLog, navigate])

  return (
    <div style={{ height: '100dvh', width: '100%', position: 'relative', backgroundColor: 'var(--c-bg)' }}>
      {/* Back button overlay */}
      <button 
        onClick={() => navigate('/')} 
        style={{ 
          position: 'absolute', top: '16px', right: '16px', zIndex: 30, 
          background: 'none', border: '2px solid white', 
          borderRadius: '50%', width: '48px', height: '48px', 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', backgroundColor: 'rgba(0,0,0,0.5)', cursor: 'pointer'
        }}
      >
        <span className="material-symbols-outlined">close</span>
      </button>

      {/* Full-bleed viewfinder */}
      <VideoRecorder 
        onVideoReady={setVideoEl} 
        onError={setError} 
        capturedFrames={capturedFrames} 
        onClick={handleCapture}
        isAnalyzing={analyzing}
      />

      {error && (
        <div className="neo-banner error" style={{ position: 'absolute', bottom: '24px', left: '16px', right: '16px', zIndex: 30 }}>
          {error}
        </div>
      )}
    </div>
  )
}
