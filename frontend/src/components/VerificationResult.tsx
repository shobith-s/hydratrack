import { useNavigate } from 'react-router-dom'

interface VerificationResultProps {
  confirmed: boolean
  confidence: number
  offline?: boolean
  loggedAt?: string
}

export function VerificationResult({ confirmed, confidence, offline, loggedAt }: VerificationResultProps) {
  const navigate = useNavigate()
  const percentage = Math.round(confidence * 100)
  const timeStr = loggedAt
    ? new Date(loggedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    : new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

  return (
    <div className="px-4 py-6 flex flex-col gap-8 max-w-lg mx-auto w-full">

      {/* Result card */}
      <div className="bg-white border-[3px] border-black p-6 flex flex-col gap-6" style={{ boxShadow: '5px 5px 0px #000' }}>
        {/* Header row */}
        <div className="flex items-start justify-between">
          <div className="w-20 h-20 bg-white border-[3px] border-black flex items-center justify-center">
            {confirmed ? (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="#00C896">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM9.29 16.29L5.7 12.7a.996.996 0 1 1 1.41-1.41L10 14.17l6.88-6.88a.996.996 0 1 1 1.41 1.41l-7.59 7.59a.996.996 0 0 1-1.41 0z"/>
              </svg>
            ) : (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="#FF3B30">
                <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
              </svg>
            )}
          </div>
          <div className={`px-2 py-1 border-[2px] border-black text-[10px] font-black uppercase ${confirmed ? 'bg-[#00C896] text-black' : 'bg-[#FF3B30] text-white'}`}>
            {confirmed ? 'Result: Success' : 'Result: Failed'}
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h2
            className="font-black uppercase tracking-tighter leading-none"
            style={{ fontSize: '2.5rem', color: confirmed ? '#000' : '#FF3B30' }}
          >
            {confirmed ? 'DRINK VERIFIED!' : 'NOT VERIFIED'}
          </h2>
          <p className="text-[11px] font-black text-black/60 uppercase">
            {percentage}% MATCH — {confirmed ? 'A PERSON DRINKING WATER' : 'LOW CONFIDENCE'}
          </p>
        </div>

        {/* Confidence bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-[10px] font-black uppercase">CONFIDENCE</span>
            <span className="text-sm font-black">{percentage}%</span>
          </div>
          <div className="w-full h-8 border-[3px] border-black bg-[#FFFBE6] relative overflow-hidden">
            <div
              className="h-full border-r-[3px] border-black transition-all duration-700"
              style={{
                width: `${percentage}%`,
                backgroundColor: confirmed ? '#0448FF' : '#FF3B30',
              }}
            />
          </div>
        </div>

        {/* Action */}
        <div className="flex flex-col gap-3 pt-2">
          {confirmed ? (
            <>
              <button
                onClick={() => navigate('/')}
                className="w-full h-14 bg-[#0448FF] border-[3px] border-black text-white font-black text-base uppercase tracking-wide active:translate-x-[2px] active:translate-y-[2px] transition-all"
                style={{ boxShadow: '4px 4px 0px #000' }}
              >
                + LOG 250ML ✓
              </button>
              <p className="text-center text-[10px] font-bold text-black/50">
                {offline ? 'Saved offline — will sync when connected' : `Logged at ${timeStr}`}
              </p>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/camera')}
                className="w-full h-14 bg-[#FDD400] border-[3px] border-black text-black font-black text-base uppercase tracking-wide active:translate-x-[2px] active:translate-y-[2px] transition-all"
                style={{ boxShadow: '4px 4px 0px #000' }}
              >
                TRY AGAIN
              </button>
              <p className="text-center text-[10px] font-bold text-black/40 px-4 leading-tight">
                Make sure your face and cup are clearly visible
              </p>
            </>
          )}
        </div>
      </div>

      {/* AI logs decorative block */}
      <div className="border-[3px] border-black bg-black text-white p-4">
        <p className="text-[10px] font-black uppercase mb-2 text-[#FDD400]">System Logs // HydroAI v4.2</p>
        <div className="space-y-1 opacity-80">
          {[
            { label: '> ANALYZING_FLUID_DYNAMICS...', status: 'OK' },
            { label: '> MAPPING_FACIAL_MUSCLES...', status: 'OK' },
            { label: '> VESSEL_RECOGNITION...', status: confirmed ? 'MATCH' : 'FAIL', highlight: true },
          ].map(({ label, status, highlight }) => (
            <div key={label} className="flex justify-between text-[10px] font-mono">
              <span>{label}</span>
              <span style={{ color: highlight ? (confirmed ? '#00C896' : '#FF3B30') : undefined }}>{status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* View history link */}
      <button
        onClick={() => navigate('/history')}
        className="text-sm font-black uppercase underline text-center tracking-wide"
      >
        View Full History →
      </button>
    </div>
  )
}
