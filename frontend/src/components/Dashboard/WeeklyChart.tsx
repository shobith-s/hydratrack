import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { DayRecord } from '../../store/drinkStore'

export function WeeklyChart({ data }: { data: DayRecord[] }) {
  if (!data || data.length === 0) return null

  // Format data for Recharts, sort chronologically
  const chartData = [...data].reverse().map(d => {
    const ml = d.confirmed_count * 250
    const dayName = new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })
    return {
      name: dayName,
      ml,
      goalHit: d.goal_hit,
      fill: d.goal_hit ? '#00DFA2' : '#40A2E3' // Mint if goal hit, else Blue
    }
  })

  return (
    <div className="neo-card w-full h-[250px] p-2 pr-6 mt-4 relative">
      <h3 className="font-bold mb-4 ml-4">Weekly History</h3>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={chartData}>
          <XAxis 
            dataKey="name" 
            axisLine={{ stroke: '#0F0F0F', strokeWidth: 3 }}
            tickLine={false}
            tick={{ fontFamily: 'Space Grotesk', fontSize: 12, fontWeight: 'bold' }}
          />
          <YAxis 
            axisLine={{ stroke: '#0F0F0F', strokeWidth: 3 }}
            tickLine={false}
            tick={{ fontFamily: 'Space Grotesk', fontSize: 12, fontWeight: 'bold' }}
            width={50}
          />
          <Tooltip 
            cursor={{ fill: '#FFFBE6' }}
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '3px solid #000', 
              borderRadius: '0px',
              boxShadow: '4px 4px 0px #000',
              fontFamily: 'Space Grotesk',
              fontWeight: 'bold'
            }}
            formatter={(value: any) => [`${value} ml`, 'Water']}
          />
          <Bar 
            dataKey="ml" 
            radius={[0, 0, 0, 0]} 
            stroke="#0F0F0F" 
            strokeWidth={3} 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
