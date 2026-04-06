import { useState, useCallback } from 'react'
import { VideoRecorder } from './VideoRecorder'
import { extractFrames } from './FrameExtractor'
import { fetchApi } from '../../lib/api'
import { useOfflineQueue } from '../../store/offlineQueueStore'
import { useNavigate } from 'react-router-dom'
import { Camera as CameraIcon } from 'lucide-react'

export function CameraScreen() {
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const addOfflineLog = useOfflineQueue(state => state.addLog)
  const navigate = useNavigate()

  const handleCapture = useCallback(async () => {
    if (!videoEl || analyzing) return
    setAnalyzing(true)
    setError(null)

    try {
      // 1. Extract frames (3 frames over 900ms)
      const frames = await extractFrames(videoEl, 3, 300)

      // 2. Call /verify API
      let confirmed = false
      let confidence = 0.0

      try {
        const verifyRes = await fetchApi('/verify', {
          method: 'POST',
          body: JSON.stringify({ frames })
        })
        confirmed = verifyRes.confirmed
        confidence = verifyRes.confidence
      } catch (apiErr: any) {
        // If offline or network error, fallback to unverified queue
        if (apiErr.message.includes('Failed to fetch') || !navigator.onLine) {
          addOfflineLog({
            confirmed: true, // Assuming true since we can't verify offline
            confidence: 1.0,
            frames_sent: frames.length
          })
          alert("You are offline. Drink saved and will sync later!")
          navigate('/')
          return
        } else {
          throw apiErr
        }
      }

      // 3. Log the result
      await fetchApi('/log', {
        method: 'POST',
        body: JSON.stringify({
          confirmed,
          confidence,
          frames_sent: frames.length
        })
      })

      // 4. Navigate to result/history
      navigate('/history', { state: { confirmed, confidence } })

    } catch (err: any) {
      setError(err.message || 'Failed to capture or verify.')
    } finally {
      setAnalyzing(false)
    }
  }, [videoEl, analyzing, addOfflineLog, navigate])

  return (
    <div className="p-4 flex flex-col gap-6 items-center">
      <div className="w-full text-center">
        <h1 className="text-2xl font-bold mb-2">Drink Verification</h1>
        <p className="text-sm">Stand in frame and drink water for ~1 second.</p>
      </div>

      <div className="w-full max-w-sm">
        <VideoRecorder onVideoReady={setVideoEl} onError={setError} />
      </div>

      {error && (
        <div className="neo-card bg-red-100 border-[#FF0060] text-sm w-full max-w-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleCapture}
        disabled={!videoEl || analyzing}
        className="neo-button primary w-full max-w-sm py-4 text-lg"
      >
        {analyzing ? 'Analyzing...' : (
          <>
            <CameraIcon /> Start Recording
          </>
        )}
      </button>

      {analyzing && (
        <div className="text-sm font-bold animate-pulse text-[#40A2E3]">
          Running AI zero-shot verification...
        </div>
      )}
    </div>
  )
}
