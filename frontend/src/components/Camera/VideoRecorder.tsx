import { useRef, useEffect, useState } from 'react'

interface VideoRecorderProps {
  onVideoReady: (video: HTMLVideoElement) => void
  onError: (err: string) => void
  capturedFrames?: string[]
}

export function VideoRecorder({ onVideoReady, onError, capturedFrames = [] }: VideoRecorderProps) {
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
    <div className="relative w-full bg-neutral-800 border-[3px] border-black overflow-hidden" style={{ aspectRatio: '4/5', boxShadow: '5px 5px 0px #000' }}>
      {/* Not-ready overlay */}
      {!stream && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="rgba(255,255,255,0.2)">
            <path d="M12 9a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3m0 8a5 5 0 0 1-5-5 5 5 0 0 1 5-5 5 5 0 0 1 5 5 5 5 0 0 1-5 5m0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5z"/>
          </svg>
        </div>
      )}

      {/* Video feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />

      {/* Corner guide frame */}
      <div className="absolute inset-[16px] border-[2px] border-white/20 pointer-events-none" />

      {/* READY tag */}
      {stream && (
        <div className="absolute top-4 right-4 bg-[#FDD400] border-[2px] border-black px-3 py-1 font-black text-xs tracking-widest uppercase z-10">
          READY
        </div>
      )}

      {/* REC indicator */}
      {stream && (
        <div className="absolute top-4 left-4 flex items-center gap-1.5 z-10">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] text-white font-black uppercase leading-none">LIVE</span>
        </div>
      )}

      {/* Frame strip (bottom) */}
      {capturedFrames.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 flex gap-2 p-2 z-10">
          {capturedFrames.map((f, i) => (
            <img
              key={i}
              src={`data:image/jpeg;base64,${f}`}
              alt={`Frame ${i + 1}`}
              className="w-16 h-16 object-cover border-[2px] border-white/60 flex-shrink-0"
            />
          ))}
        </div>
      )}
    </div>
  )
}
