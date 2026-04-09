import { useDrinkStore } from '../../store/drinkStore'
import { WeeklyChart } from '../Dashboard/WeeklyChart'

const ML_PER_DRINK = 250

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()
}

export function HistoryScreen() {
  const store = useDrinkStore()

  // Week label
  const weeklyHistory = store.weeklyHistory
  const weekLabel = (() => {
    if (!weeklyHistory.length) return ''
    const sorted = [...weeklyHistory].sort((a, b) => a.date.localeCompare(b.date))
    const start = new Date(sorted[0].date + 'T12:00:00')
    const end = new Date(sorted[sorted.length - 1].date + 'T12:00:00')
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
    return `${fmt(start)} – ${fmt(end)}`
  })()

  const isActiveWeek = weeklyHistory.some(d => d.goal_hit)

  return (
    <>
      {/* Weekly summary */}
      <div className="neo-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <p style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>This Week</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', lineHeight: 1.2 }}>{weekLabel || '—'}</p>
          </div>
          {isActiveWeek && (
            <div style={{ backgroundColor: 'var(--c-yellow)', border: '2px solid var(--c-black)', padding: '4px 8px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', boxShadow: '3px 3px 0px var(--c-black)' }}>
              ACTIVE WEEK
            </div>
          )}
        </div>

        <WeeklyChart data={weeklyHistory} goalMl={store.dailyGoalMl} />
      </div>

      {/* Daily log */}
      <div>
        <div className="section-title-wrapper">
          <h2 className="section-title" style={{ fontStyle: 'italic', fontSize: '1.875rem' }}>DAILY LOG</h2>
          <div className="section-title-highlight" style={{ height: '16px' }} />
        </div>

        {store.isLoading && (
          <div className="text-center font-black uppercase" style={{ padding: '32px 0', letterSpacing: '0.1em' }}>Loading...</div>
        )}

        {!store.isLoading && weeklyHistory.length === 0 && (
          <div className="neo-card text-center" style={{ fontWeight: 700, fontSize: '0.875rem' }}>
            No history yet. Start logging drinks!
          </div>
        )}

        <div className="drink-entries">
          {[...weeklyHistory]
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((day) => {
              const ml = day.confirmed_count * ML_PER_DRINK
              return (
                <div
                  key={day.date}
                  className="neo-card"
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.1s', cursor: 'pointer' }}
                  onMouseDown={(e) => { e.currentTarget.style.transform = 'translate(2px, 2px)' }}
                  onMouseUp={(e) => { e.currentTarget.style.transform = 'none' }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'none' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <p style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', opacity: 0.5 }}>{formatDate(day.date)}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 900 }}>{ml.toLocaleString()} ML</span>
                      <span style={{ fontSize: '10px', fontWeight: 700, opacity: 0.5 }}>{day.confirmed_count}x drinks</span>
                    </div>
                  </div>
                  <div style={{
                    padding: '4px 8px', border: '2px solid var(--c-black)', fontSize: '9px', fontWeight: 900, textTransform: 'uppercase',
                    backgroundColor: day.goal_hit ? 'var(--c-mint)' : 'var(--c-red)',
                    color: day.goal_hit ? 'var(--c-black)' : 'var(--c-white)'
                  }}>
                    {day.goal_hit ? 'GOAL ✓' : 'MISSED'}
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    </>
  )
}
