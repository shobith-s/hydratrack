import type { HourlyBucket } from '../../store/drinkStore'

export function HourlyTimeline({ breakdown }: { breakdown: HourlyBucket[] }) {
  if (!breakdown || breakdown.length === 0) {
    return (
      <div className="neo-card bg-white mt-4">
        <h3 className="font-bold text-lg mb-2">Today's Timeline</h3>
        <p className="text-sm text-gray-500">You haven't logged any drinks today.</p>
      </div>
    )
  }

  // Sort chronologically just in case
  const sorted = [...breakdown].sort((a, b) => a.hour - b.hour)

  return (
    <div className="neo-card bg-white mt-4">
      <h3 className="font-bold text-lg mb-4 border-b-2 border-black pb-2">Today's Timeline</h3>
      <div className="flex flex-col gap-4">
        {sorted.map((bucket) => {
          const ampm = bucket.hour >= 12 ? 'PM' : 'AM'
          const displayHour = bucket.hour % 12 || 12
          const time = `${displayHour}:00 ${ampm}`

          return (
            <div key={bucket.hour} className="flex items-center gap-4">
              <div className="w-20 font-bold font-mono text-sm border-r-[3px] border-black pr-2 text-right">
                {time}
              </div>
              <div className="flex gap-2">
                {Array.from({ length: bucket.count }).map((_, i) => (
                  <div 
                    key={i} 
                    className="w-6 h-6 bg-[#40A2E3] neo-border rounded-full flex items-center justify-center animate-in zoom-in duration-300"
                    title="250ml Drink"
                  >
                    <span className="text-[10px]">💧</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
