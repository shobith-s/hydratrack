/**
 * Extracts base64 JPEG frames from an active HTMLVideoElement using a hidden canvas.
 */

export async function extractFrames(
  video: HTMLVideoElement,
  count: number = 3,
  intervalMs: number = 300
): Promise<string[]> {
  const canvas = document.createElement('canvas')
  canvas.width = 224 // CLIP size
  canvas.height = 224
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context not available')

  const frames: string[] = []

  for (let i = 0; i < count; i++) {
    // Center crop the video feed
    const minDim = Math.min(video.videoWidth, video.videoHeight)
    const sx = (video.videoWidth - minDim) / 2
    const sy = (video.videoHeight - minDim) / 2

    ctx.drawImage(video, sx, sy, minDim, minDim, 0, 0, 224, 224)
    
    // get as base64 JPEG
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
    // Strip the "data:image/jpeg;base64," prefix for the backend
    const b64 = dataUrl.split(',')[1]
    frames.push(b64)

    if (i < count - 1) {
      await new Promise(resolve => setTimeout(resolve, intervalMs))
    }
  }

  return frames
}
