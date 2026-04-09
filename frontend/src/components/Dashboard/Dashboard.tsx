import { useEffect } from 'react'
import { useDrinkStore } from '../../store/drinkStore'
import { fetchApi } from '../../lib/api'
import { ProgressRing } from './ProgressRing'
import { EmergencyMode } from './EmergencyMode'
import { useNavigate } from 'react-router-dom'
import { usePush } from '../../hooks/usePush'

const ML_PER_DRINK = 250

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

export function Dashboard() {
  const store = useDrinkStore()
  const navigate = useNavigate()
  const { subscribeToPush } = usePush()

  // Extract stable Zustand action references so the effect deps are satisfied
  // without causing re-runs (Zustand actions never change between renders)
  const setLoading = useDrinkStore(s => s.setLoading)
  const setError = useDrinkStore(s => s.setError)
  const setAnalytics = useDrinkStore(s => s.setAnalytics)

  useEffect(() => {
    if (Notification.permission === 'granted') {
      subscribeToPush()
    }

    async function loadStats() {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchApi('/analytics')
        setAnalytics({
          dailyGoalMl: data.daily_goal_ml,
          todayConfirmedCount: data.today_confirmed_count,
          todayMlEstimate: data.today_ml_estimate,
          streakDays: data.streak_days,
          hourlyBreakdown: data.hourly_breakdown,
          weeklyHistory: data.weekly_history,
          todayEntries: data.today_entries ?? [],
        })
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [subscribeToPush, setLoading, setError, setAnalytics])

  if (store.isLoading && store.todayConfirmedCount === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="font-black text-center uppercase tracking-widest">Loading...</div>
      </div>
    )
  }

  const pctDone = Math.round((store.todayMlEstimate / store.dailyGoalMl) * 100)
  const nextReminderHrs = '1 HR'

  return (
    <div className="px-4 py-6 flex flex-col gap-6 max-w-lg mx-auto w-full">

      {/* Progress Ring */}
      <div className="flex justify-center">
        <ProgressRing current={store.todayMlEstimate} target={store.dailyGoalMl} />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border-[3px] border-black p-3 flex flex-col items-center justify-center text-center" style={{ boxShadow: '5px 5px 0px #000' }}>
          <span className="text-2xl" style={{ color: '#FF4500' }}>🔥</span>
          <span className="text-xl font-black leading-none">{store.streakDays}</span>
          <span className="text-[10px] font-black uppercase leading-none mt-1">Streak</span>
        </div>
        <div className="bg-white border-[3px] border-black p-3 flex flex-col items-center justify-center text-center" style={{ boxShadow: '5px 5px 0px #000' }}>
          <span className="text-xl font-black leading-none text-[#0448FF]">📊</span>
          <span className="text-xl font-black leading-none">{pctDone}%</span>
          <span className="text-[10px] font-black uppercase leading-none mt-1">Done</span>
        </div>
        <div className="bg-white border-[3px] border-black p-3 flex flex-col items-center justify-center text-center" style={{ boxShadow: '5px 5px 0px #000' }}>
          <span className="text-xl font-black leading-none">⏱</span>
          <span className="text-xl font-black leading-none">{nextReminderHrs}</span>
          <span className="text-[10px] font-black uppercase leading-none mt-1">Reminder</span>
        </div>
      </div>

      {/* Offline queue */}
      <EmergencyMode />

      {/* Today's Drinks */}
      <div className="flex flex-col gap-3">
        <div className="relative inline-block">
          <h2 className="text-xl font-black uppercase tracking-tight relative z-10">Today's Drinks</h2>
          <div className="absolute bottom-1 left-0 w-full h-3 bg-[#FDD400] -z-[1]" />
        </div>

        {store.todayEntries.length === 0 ? (
          <div className="bg-white border-[3px] border-black p-4 text-sm font-bold text-center" style={{ boxShadow: '5px 5px 0px #000' }}>
            No drinks logged yet today. Tap <span className="font-black">RECORD</span> to start!
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {store.todayEntries.map((entry) => {
              const conf = entry.confidence != null ? Math.round(entry.confidence * 100) : null
              return (
                <div
                  key={entry.id}
                  className="bg-white border-[3px] border-black p-4 flex justify-between items-center"
                  style={{ boxShadow: '5px 5px 0px #000' }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#0448FF] border-[3px] border-black flex items-center justify-center flex-shrink-0">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-black text-lg leading-none">{ML_PER_DRINK} ML</p>
                      <p className="text-[10px] font-black uppercase opacity-60 mt-1">{formatTime(entry.logged_at)}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="bg-[#00C896] border-[2px] border-black px-2 py-0.5 text-[8px] font-black uppercase">
                      Verified ✓
                    </div>
                    {conf != null && (
                      <span className="text-[10px] font-black">{conf}% CONF.</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {store.error && (
        <div className="text-sm font-bold text-[#FF3B30] p-3 bg-white border-[3px] border-black text-center">
          {store.error}
        </div>
      )}

      {/* FAB: Log Drink */}
      <button
        onClick={() => navigate('/camera')}
        className="fixed bottom-24 right-4 w-14 h-14 bg-[#0448FF] border-[3px] border-black text-white flex items-center justify-center z-40 active:translate-x-[2px] active:translate-y-[2px] transition-all"
        style={{ boxShadow: '5px 5px 0px #000' }}
        aria-label="Log drink"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
    </div>
  )
}
