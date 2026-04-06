export function ProgressRing({ current, target }: { current: number; target: number }) {
  const radius = 90;
  const stroke = 18;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  
  const percent = Math.min((current / target) * 100, 100);
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center neo-card rounded-full p-2 w-[240px] h-[240px] bg-white border-[4px] border-black shadow-[6px_6px_0px_0px_#0F0F0F]">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90"
      >
        <circle
          stroke="#e5e7eb"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="#40A2E3"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-4xl font-bold font-mono">{current}</span>
        <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">/ {target} ml</span>
      </div>
    </div>
  )
}
