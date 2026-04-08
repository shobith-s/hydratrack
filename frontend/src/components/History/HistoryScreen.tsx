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
    <div className="px-4 py-6 flex flex-col gap-6 max-w-lg mx-auto w-full">

      {/* Weekly summary */}
      <div className="bg-white border-[3px] border-black p-5 flex flex-col gap-5" style={{ boxShadow: '5px 5px 0px #000' }}>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-black/50">This Week</p>
            <p className="text-2xl font-black uppercase leading-tight">{weekLabel || '—'}</p>
          </div>
          {isActiveWeek && (
            <div className="bg-[#FDD400] border-[2px] border-black px-2 py-1 text-[10px] font-black uppercase" style={{ boxShadow: '3px 3px 0px #000' }}>
              ACTIVE WEEK
            </div>
          )}
        </div>

        <WeeklyChart data={weeklyHistory} goalMl={store.dailyGoalMl} />
      </div>

      {/* Daily log */}
      <div className="relative inline-block">
        <h2 className="text-3xl font-black uppercase italic tracking-tighter relative z-10">DAILY LOG</h2>
        <div className="absolute bottom-1 left-0 w-full h-4 bg-[#FDD400] -z-[1]" />
      </div>

      {store.isLoading && (
        <div className="font-black text-center uppercase tracking-widest py-8">Loading...</div>
      )}

      {!store.isLoading && weeklyHistory.length === 0 && (
        <div className="bg-white border-[3px] border-black p-4 font-bold text-center text-sm" style={{ boxShadow: '5px 5px 0px #000' }}>
          No history yet. Start logging drinks!
        </div>
      )}

      <div className="flex flex-col gap-4">
        {[...weeklyHistory]
          .sort((a, b) => b.date.localeCompare(a.date))
          .map((day) => {
            const ml = day.confirmed_count * ML_PER_DRINK
            return (
              <div
                key={day.date}
                className="bg-white border-[3px] border-black p-4 flex justify-between items-center active:translate-x-[2px] active:translate-y-[2px] transition-all"
                style={{ boxShadow: '5px 5px 0px #000' }}
              >
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-black/50">{formatDate(day.date)}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black">{ml.toLocaleString()} ML</span>
                    <span className="text-[10px] font-bold text-black/50">{day.confirmed_count}x drinks</span>
                  </div>
                </div>
                <div className={`px-2 py-1 border-[2px] border-black text-[9px] font-black uppercase ${day.goal_hit ? 'bg-[#00C896] text-black' : 'bg-[#FF3B30] text-white'}`}>
                  {day.goal_hit ? 'GOAL ✓' : 'MISSED'}
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}
