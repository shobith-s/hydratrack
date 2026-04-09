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
    <div className="camera-container">

      {/* Viewfinder */}
      <VideoRecorder 
        onVideoReady={setVideoEl} 
        onError={setError} 
        capturedFrames={capturedFrames} 
        onClick={handleCapture}
        isAnalyzing={analyzing}
      />

      {/* Instruction card */}
      <div className="camera-instruction">
        <h2>TAP SCREEN TO RECORD</h2>
        <p>Tap the video feed and hold your drink for 3–5 seconds. Show your face clearly.</p>
      </div>

      {/* Frame preview strip */}
      {capturedFrames.length === 0 && (
        <div className="camera-frames">
          {[1, 2, 3].map((n) => (
            <div key={n} className="camera-frame-box">
              <div className="camera-frame-placeholder">
                <span className="material-symbols-outlined" style={{ color: '#bbb', fontSize: '16px' }}>image</span>
              </div>
              <span>FRAME {n}</span>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="neo-banner error">
          {error}
        </div>
      )}

    </div>
  )
}
