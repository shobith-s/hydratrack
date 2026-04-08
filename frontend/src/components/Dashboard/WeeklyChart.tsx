import type { DayRecord } from '../../store/drinkStore'

const ML_PER_DRINK = 250

interface WeeklyChartProps {
  data: DayRecord[]
  goalMl?: number
}

export function WeeklyChart({ data, goalMl = 3000 }: WeeklyChartProps) {
  if (!data || data.length === 0) return null

  const sorted = [...data].reverse()
  const maxMl = Math.max(...sorted.map(d => d.confirmed_count * ML_PER_DRINK), goalMl)

  const daysHit = sorted.filter(d => d.goal_hit).length
  const avgL = sorted.length
    ? (sorted.reduce((s, d) => s + d.confirmed_count * ML_PER_DRINK, 0) / sorted.length / 1000).toFixed(1)
    : '0.0'
  const bestStreak = (() => {
    let max = 0, cur = 0
    for (const d of sorted) {
      cur = d.goal_hit ? cur + 1 : 0
      max = Math.max(max, cur)
    }
    return max
  })()

  return (
    <div className="bg-white border-[3px] border-black p-5 flex flex-col gap-5" style={{ boxShadow: '5px 5px 0px #000' }}>
      {/* Bar chart */}
      <div className="flex items-end justify-between gap-2" style={{ height: 140 }}>
        {sorted.map((d) => {
          const ml = d.confirmed_count * ML_PER_DRINK
          const heightPct = maxMl > 0 ? (ml / maxMl) * 100 : 0
          const dayName = new Date(d.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
          return (
            <div key={d.date} className="flex flex-col items-center flex-1 h-full justify-end gap-1">
              <div
                className="w-full border-[3px] border-black transition-all duration-500"
                style={{
                  height: `${Math.max(heightPct, 4)}%`,
                  backgroundColor: d.goal_hit ? '#0448FF' : '#FDD400',
                }}
              />
              <span className="text-[9px] font-black">{dayName}</span>
            </div>
          )
        })}
      </div>

      {/* Stat chips */}
      <div className="flex flex-wrap gap-2">
        <div className="border-[3px] border-black px-3 py-1 bg-[#F8F4DC] font-black text-xs" style={{ boxShadow: '3px 3px 0px #000' }}>
          {daysHit}/{sorted.length} DAYS ✓
        </div>
        <div className="border-[3px] border-black px-3 py-1 bg-[#F8F4DC] font-black text-xs" style={{ boxShadow: '3px 3px 0px #000' }}>
          AVG {avgL}L
        </div>
        {bestStreak > 0 && (
          <div className="border-[3px] border-black px-3 py-1 bg-[#FDD400] font-black text-xs" style={{ boxShadow: '3px 3px 0px #000' }}>
            BEST STREAK {bestStreak}
          </div>
        )}
      </div>
    </div>
  )
}
