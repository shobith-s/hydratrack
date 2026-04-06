import { create } from 'zustand'

export interface HourlyBucket {
  hour: number
  count: number
}

export interface DayRecord {
  date: string
  confirmed_count: number
  goal_hit: boolean
}

interface AnalyticsState {
  dailyGoalMl: number
  todayConfirmedCount: number
  todayMlEstimate: number
  streakDays: number
  hourlyBreakdown: HourlyBucket[]
  weeklyHistory: DayRecord[]
  isLoading: boolean
  error: string | null
  
  setAnalytics: (data: Partial<AnalyticsState>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useDrinkStore = create<AnalyticsState>((set) => ({
  dailyGoalMl: 3000,
  todayConfirmedCount: 0,
  todayMlEstimate: 0,
  streakDays: 0,
  hourlyBreakdown: [],
  weeklyHistory: [],
  isLoading: false,
  error: null,

  setAnalytics: (data) => set((state) => ({ ...state, ...data })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}))
