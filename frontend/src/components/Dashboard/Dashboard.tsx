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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div style={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Loading...</div>
      </div>
    )
  }

  const pctDone = Math.round((store.todayMlEstimate / store.dailyGoalMl) * 100)
  const nextReminderHrs = '3 HRS'

  return (
    <>
      <ProgressRing current={store.todayMlEstimate} target={store.dailyGoalMl} />

      <div className="neo-stats-grid">
        <div className="neo-stat-box">
          <span className="material-symbols-outlined" style={{ color: '#FF4500' }}>local_fire_department</span>
          <span className="main-value">{store.streakDays}</span>
          <span className="label">Streak</span>
        </div>
        <div className="neo-stat-box">
          <span className="material-symbols-outlined" style={{ color: 'var(--c-blue)' }}>pie_chart</span>
          <span className="main-value">{pctDone}%</span>
          <span className="label">Done</span>
        </div>
        <div className="neo-stat-box">
          <span className="material-symbols-outlined">schedule</span>
          <span className="main-value">{nextReminderHrs}</span>
          <span className="label">Reminder</span>
        </div>
      </div>

      <EmergencyMode />

      <div>
        <div className="section-title-wrapper">
          <h2 className="section-title">Today's Drinks</h2>
          <div className="section-title-highlight" />
        </div>

        {store.todayEntries.length === 0 ? (
          <div className="neo-card text-center">
            No drinks logged yet today. <br />Tap <strong>RECORD</strong> to start!
          </div>
        ) : (
          <div className="drink-entries">
            {store.todayEntries.map((entry) => {
              const conf = entry.confidence != null ? Math.round(entry.confidence * 100) : null
              return (
                <div key={entry.id} className="drink-entry">
                  <div className="drink-entry-left">
                    <div className="drink-icon-box">
                      <span className="material-symbols-outlined">water_full</span>
                    </div>
                    <div>
                      <div className="drink-amount">{ML_PER_DRINK} ML</div>
                      <div className="drink-time">{formatTime(entry.logged_at)}</div>
                    </div>
                  </div>
                  <div className="drink-entry-right">
                    <div className="badge-verified">Verified ✓</div>
                    {conf != null && (
                      <div className="confidence-text">{conf}% CONF.</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {store.error && (
        <div className="neo-banner error">
          {store.error}
        </div>
      )}

      {/* FAB: Log Drink */}
      <button
        onClick={() => navigate('/camera')}
        className="neo-fab"
        aria-label="Log drink"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>photo_camera</span>
      </button>
    </>
  )
}
