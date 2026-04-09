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
    <>
      <div className="neo-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        <div className="result-header-row">
          <div className="result-icon">
            {confirmed ? (
              <span className="material-symbols-outlined" style={{ color: 'var(--c-mint)', fontSize: '48px' }}>check_circle</span>
            ) : (
              <span className="material-symbols-outlined" style={{ color: 'var(--c-red)', fontSize: '48px' }}>error</span>
            )}
          </div>
          <div className={`result-badge ${confirmed ? 'success' : 'fail'}`}>
            {confirmed ? 'Result: Success' : 'Result: Failed'}
          </div>
        </div>

        <div>
          <h2 className="result-title" style={{ color: confirmed ? 'var(--c-black)' : 'var(--c-red)' }}>
            {confirmed ? 'DRINK VERIFIED!' : 'NOT VERIFIED'}
          </h2>
          <p className="result-subtitle">
            {percentage}% MATCH — {confirmed ? 'A PERSON DRINKING WATER' : 'LOW CONFIDENCE'}
          </p>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
            <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}>CONFIDENCE</span>
            <span style={{ fontSize: '14px', fontWeight: 900 }}>{percentage}%</span>
          </div>
          <div className="confidence-bar-container">
            <div
              className="confidence-bar-fill"
              style={{
                width: `${percentage}%`,
                backgroundColor: confirmed ? 'var(--c-blue)' : 'var(--c-red)',
              }}
            />
          </div>
        </div>

        <div className="result-actions">
          {confirmed ? (
            <>
              <button onClick={() => navigate('/')} className="neo-button-large neo-button-primary">
                + LOG 250ML ✓
              </button>
              <p style={{ textAlign: 'center', fontSize: '10px', fontWeight: 900, opacity: 0.5 }}>
                {offline ? 'Saved offline — will sync when connected' : `Logged at ${timeStr}`}
              </p>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/camera')} className="neo-button-large neo-button-secondary">
                TRY AGAIN
              </button>
              <p style={{ textAlign: 'center', fontSize: '10px', fontWeight: 900, opacity: 0.5, lineHeight: 1.2 }}>
                Make sure your face and cup are clearly visible
              </p>
            </>
          )}
        </div>
      </div>

      <div className="log-terminal">
        <p className="log-terminal-header">System Logs // HydroAI v4.2</p>
        <div>
          {[
            { label: '> ANALYZING_FLUID_DYNAMICS...', status: 'OK' },
            { label: '> MAPPING_FACIAL_MUSCLES...', status: 'OK' },
            { label: '> VESSEL_RECOGNITION...', status: confirmed ? 'MATCH' : 'FAIL', highlight: true },
          ].map(({ label, status, highlight }) => (
            <div key={label} className="log-terminal-row">
              <span>{label}</span>
              <span style={{ color: highlight ? (confirmed ? 'var(--c-mint)' : 'var(--c-red)') : undefined }}>{status}</span>
            </div>
          ))}
        </div>
      </div>

      <button onClick={() => navigate('/history')} className="link-button">
        View Full History →
      </button>
    </>
  )
}
