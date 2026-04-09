export function ProgressRing({ current, target }: { current: number; target: number }) {
  const size = 256
  const cx = size / 2
  const cy = size / 2
  const strokeWidth = 20
  const radius = cx - strokeWidth / 2 - 4
  const circumference = radius * 2 * Math.PI
  const percent = Math.min((current / target) * 100, 100)
  const strokeDashoffset = circumference - (percent / 100) * circumference

  return (
    <div className="hero-metrics">
      <div className="progress-ring-container">
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="transparent"
            stroke="#000000"
            strokeWidth={strokeWidth}
            strokeOpacity={0.1}
          />
          {/* Progress */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="transparent"
            stroke="#0448FF"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="square"
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        <div className="progress-text">
          <span className="progress-text-value">{current.toLocaleString()}</span>
          <span className="progress-text-label">/ {target.toLocaleString()} ML</span>
        </div>
      </div>
      <div className="today-goal-badge">
        Today's Goal
      </div>
    </div>
  )
}
