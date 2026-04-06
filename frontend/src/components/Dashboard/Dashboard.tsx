import { useEffect } from 'react'
import { useDrinkStore } from '../../store/drinkStore'
import { fetchApi } from '../../lib/api'
import { ProgressRing } from './ProgressRing'
import { HourlyTimeline } from './HourlyTimeline'
import { StreakBadge } from './StreakBadge'
import { EmergencyMode } from './EmergencyMode'
import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { usePush } from '../../hooks/usePush'

export function Dashboard() {
  const store = useDrinkStore()
  const navigate = useNavigate()
  const { subscribeToPush } = usePush()

  useEffect(() => {
    // Attempt push subscription in background when dashboard loads if permitted
    if (Notification.permission === 'granted') {
      subscribeToPush()
    }

    async function loadStats() {
      store.setLoading(true)
      store.setError(null)
      try {
        const data = await fetchApi('/analytics')
        store.setAnalytics(data)
      } catch (e: any) {
        store.setError(e.message)
      } finally {
        store.setLoading(false)
      }
    }
    loadStats()
  }, []) // Empty deps, only run once on mount

  if (store.isLoading && store.todayConfirmedCount === 0) {
    return <div className="p-8 font-bold text-center">Loading your progress...</div>
  }

  const reachedGoal = store.todayMlEstimate >= store.dailyGoalMl

  return (
    <div className="p-4 flex flex-col gap-6">
      <div className="flex justify-between items-center bg-[#F6FA70] p-4 neo-border shadow-md rounded-none mt-2">
        <div>
          <h2 className="text-xl font-bold">Good morning! ☀️</h2>
          <p className="text-sm">Stay hydrated today.</p>
        </div>
        <StreakBadge days={store.streakDays} />
      </div>

      <div className="flex justify-center my-4 relative">
        <ProgressRing current={store.todayMlEstimate} target={store.dailyGoalMl} />
        {reachedGoal && (
          <div className="absolute inset-0 flex items-center justify-center animate-bounce pointer-events-none">
            <span className="text-4xl">🏆</span>
          </div>
        )}
      </div>

      <EmergencyMode />

      <HourlyTimeline breakdown={store.hourlyBreakdown} />

      <button 
        onClick={() => navigate('/camera')}
        className="neo-button primary w-full flex items-center justify-center gap-2 py-4"
      >
        <Plus /> Log Drink
      </button>

      {store.error && (
        <div className="text-sm font-bold text-[#FF0060] p-2 bg-white neo-border text-center">
          Error: {store.error}
        </div>
      )}
    </div>
  )
}
