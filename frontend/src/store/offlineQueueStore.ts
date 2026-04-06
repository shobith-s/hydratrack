import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface OfflineLog {
  id: string
  confirmed: boolean
  confidence: number
  frames_sent: number
  timestamp: number
}

interface OfflineQueueState {
  queue: OfflineLog[]
  addLog: (log: Omit<OfflineLog, 'id' | 'timestamp'>) => void
  removeLog: (id: string) => void
  clearQueue: () => void
}

export const useOfflineQueue = create<OfflineQueueState>()(
  persist(
    (set) => ({
      queue: [],
      addLog: (log) => set((state) => ({
        queue: [...state.queue, { ...log, id: crypto.randomUUID(), timestamp: Date.now() }]
      })),
      removeLog: (id) => set((state) => ({
        queue: state.queue.filter(log => log.id !== id)
      })),
      clearQueue: () => set({ queue: [] })
    }),
    {
      name: 'hydrotrack-offline-queue',
    }
  )
)
