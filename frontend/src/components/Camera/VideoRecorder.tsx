import { useRef, useEffect, useState } from 'react'

interface VideoRecorderProps {
  onVideoReady: (video: HTMLVideoElement) => void
  onError: (err: string) => void
  capturedFrames?: string[]
  onClick?: () => void
  isAnalyzing?: boolean
}

export function VideoRecorder({ onVideoReady, onError, capturedFrames = [], onClick, isAnalyzing = false }: VideoRecorderProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  useEffect(() => {
    let activeStream: MediaStream | null = null

    async function startCamera() {
      try {
        activeStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
        })
        setStream(activeStream)
        if (videoRef.current) {
          videoRef.current.srcObject = activeStream
          onVideoReady(videoRef.current)
        }
      } catch {
        onError('Failed to access camera. Please allow permissions.')
      }
    }

    startCamera()

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [onVideoReady, onError])

  return (
    <div 
      className="neo-card" 
      style={{ padding: 0, position: 'relative', overflow: 'hidden', height: '100%', width: '100%', cursor: onClick ? 'pointer' : 'default', backgroundColor: '#000', borderRadius: 0 }}
      onClick={() => { if (!isAnalyzing && onClick) onClick() }}
    >
      {/* Not-ready overlay */}
      {!stream && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="material-symbols-outlined" style={{color: 'rgba(255,255,255,0.4)', fontSize: '48px'}}>videocam_off</span>
        </div>
      )}

      {/* Video feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />

      {/* Corner guide frame */}
      <div style={{ position: 'absolute', inset: '16px', border: '3px solid rgba(255,255,255,0.5)', pointerEvents: 'none' }} />

      {/* READY tag */}
      {stream && !isAnalyzing && (
        <div style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: 'var(--c-yellow)', border: '2px solid var(--c-black)', padding: '4px 12px', fontWeight: 900, fontSize: '12px', textTransform: 'uppercase', zIndex: 10 }}>
          READY
        </div>
      )}

      {/* REC indicator */}
      {stream && !isAnalyzing && (
        <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 10 }}>
          <div style={{ width: '10px', height: '10px', backgroundColor: 'var(--c-red)', borderRadius: '50%' }} />
          <span style={{ fontSize: '12px', color: 'white', fontWeight: 900, textTransform: 'uppercase', textShadow: '1px 1px 0 #000' }}>TAP TO CAPTURE</span>
        </div>
      )}

      {/* Analyzing Overlay */}
      {isAnalyzing && (
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', gap: '16px' }}>
             <span className="material-symbols-outlined" style={{ fontSize: '64px', animation: 'spin 1s linear infinite' }}>sync</span>
             <h3 style={{ fontWeight: 900, fontSize: '24px', letterSpacing: '0.1em' }}>ANALYZING...</h3>
        </div>
      )}

      {/* Frame strip (bottom) */}
      {capturedFrames.length > 0 && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', gap: '8px', padding: '8px', zIndex: 10 }}>
          {capturedFrames.map((f, i) => (
            <img
              key={i}
              src={`data:image/jpeg;base64,${f}`}
              alt={`Frame ${i + 1}`}
              style={{ width: '64px', height: '64px', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.8)' }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
