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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Bar chart */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '8px', height: '140px' }}>
        {sorted.map((d) => {
          const ml = d.confirmed_count * ML_PER_DRINK
          const heightPct = maxMl > 0 ? (ml / maxMl) * 100 : 0
          const dayName = new Date(d.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
          return (
            <div key={d.date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end', gap: '4px' }}>
              <div
                style={{
                  width: '100%',
                  border: 'var(--border)',
                  transition: 'height 0.5s',
                  height: `${Math.max(heightPct, 4)}%`,
                  backgroundColor: d.goal_hit ? 'var(--c-blue)' : 'var(--c-yellow)',
                }}
              />
              <span style={{ fontSize: '9px', fontWeight: 900 }}>{dayName}</span>
            </div>
          )
        })}
      </div>

      {/* Stat chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ border: 'var(--border)', padding: '4px 12px', backgroundColor: '#F8F4DC', fontWeight: 900, fontSize: '0.75rem', boxShadow: '3px 3px 0px var(--c-black)' }}>
          {daysHit}/{sorted.length} DAYS ✓
        </div>
        <div style={{ border: 'var(--border)', padding: '4px 12px', backgroundColor: '#F8F4DC', fontWeight: 900, fontSize: '0.75rem', boxShadow: '3px 3px 0px var(--c-black)' }}>
          AVG {avgL}L
        </div>
        {bestStreak > 0 && (
          <div style={{ border: 'var(--border)', padding: '4px 12px', backgroundColor: 'var(--c-yellow)', fontWeight: 900, fontSize: '0.75rem', boxShadow: '3px 3px 0px var(--c-black)' }}>
            BEST STREAK {bestStreak}
          </div>
        )}
      </div>
    </div>
  )
}
