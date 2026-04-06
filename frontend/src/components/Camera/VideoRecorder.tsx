import { useRef, useEffect, useState } from 'react'

interface VideoRecorderProps {
  onVideoReady: (video: HTMLVideoElement) => void
  onError: (err: string) => void
}

export function VideoRecorder({ onVideoReady, onError }: VideoRecorderProps) {
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
      } catch (e) {
        onError('Failed to access camera. Please allow permissions.')
      }
    }

    startCamera()

    return () => {
      // Cleanup stream tracks when component unmounts
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [onVideoReady, onError])

  return (
    <div className="relative w-full aspect-square bg-[#0F0F0F] neo-border overflow-hidden rounded-md">
      {!stream && (
        <div className="absolute inset-0 flex items-center justify-center text-[#F6FA70] font-bold">
          Initializing Camera...
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
    </div>
  )
}
