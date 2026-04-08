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
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative bg-white border-[3px] border-black flex items-center justify-center"
        style={{ width: size, height: size, boxShadow: '5px 5px 0px #000' }}
      >
        <svg width={size} height={size} className="absolute inset-0" style={{ transform: 'rotate(-90deg)' }}>
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
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="relative flex flex-col items-center justify-center z-10">
          <span className="font-black leading-none text-black" style={{ fontSize: '3rem' }}>{current.toLocaleString()}</span>
          <span className="font-black uppercase tracking-widest text-xs border-t-[2px] border-black mt-1 pt-1">/ {target.toLocaleString()} ML</span>
        </div>
      </div>
      <div className="bg-[#FDD400] border-[3px] border-black px-6 py-2">
        <span className="font-black uppercase text-sm tracking-tight">Today's Goal</span>
      </div>
    </div>
  )
}
