import { Flame } from 'lucide-react'

export function StreakBadge({ days }: { days: number }) {
  if (days === 0) return null

  return (
    <div className="flex items-center gap-2 bg-[#FF0060] text-white neo-border px-3 py-1 font-bold shadow-[2px_2px_0px_0px_#0F0F0F] rounded-full transform rotate-3">
      <Flame size={16} fill="white" />
      <span>{days} Day{days > 1 ? 's' : ''}</span>
    </div>
  )
}
