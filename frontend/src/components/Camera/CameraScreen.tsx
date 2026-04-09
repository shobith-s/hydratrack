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
    <div className="px-4 py-6 flex flex-col gap-6 max-w-lg mx-auto w-full">

      {/* Viewfinder */}
      <VideoRecorder onVideoReady={setVideoEl} onError={setError} capturedFrames={capturedFrames} />

      {/* Instruction card */}
      <div className="bg-white border-[3px] border-black p-5" style={{ boxShadow: '5px 5px 0px #000' }}>
        <h2 className="font-black text-lg uppercase tracking-tight mb-1">DRINK WATER ON CAMERA</h2>
        <p className="text-sm font-medium text-black/70 leading-tight">
          Hold for 3–5 seconds. Show your face and the cup clearly within the frame.
        </p>
      </div>

      {/* Frame preview strip (static placeholders before capture) */}
      {capturedFrames.length === 0 && (
        <div className="flex gap-2">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex-1 border-[3px] border-black bg-white flex flex-col items-center justify-center py-3 gap-1">
              <div className="w-10 h-10 bg-neutral-100 border-[2px] border-black/20 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#bbb">
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                </svg>
              </div>
              <span className="text-[8px] font-black uppercase">FRAME {n}</span>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="text-sm font-bold text-[#FF3B30] p-3 bg-white border-[3px] border-black">
          {error}
        </div>
      )}

      {/* Hold to Record button */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={handleCapture}
          disabled={!videoEl || analyzing}
          className="w-20 h-20 rounded-full bg-[#FF3B30] border-[3px] border-black disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center"
          style={{ boxShadow: '5px 5px 0px #000' }}
          aria-label="Record"
        >
          {analyzing ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white" className="animate-spin">
              <path d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8z"/>
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <circle cx="12" cy="12" r="8"/>
            </svg>
          )}
        </button>
        <span className="font-black text-sm uppercase tracking-widest">
          {analyzing ? 'ANALYZING...' : 'HOLD TO RECORD'}
        </span>
        {!analyzing && (
          <p className="text-[10px] font-bold text-black/50 text-center">
            AI will verify your drink automatically
          </p>
        )}
      </div>
    </div>
  )
}
