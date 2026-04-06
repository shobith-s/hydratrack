import { useLocation } from 'react-router-dom'
import { WeeklyChart } from '../Dashboard/WeeklyChart'
import { VerificationResult } from '../VerificationResult'
import { useDrinkStore } from '../../store/drinkStore'

export function HistoryScreen() {
  const location = useLocation()
  const store = useDrinkStore()
  
  // State passed from CameraScreen after /verify
  const resultState = location.state as { confirmed: boolean, confidence: number } | null

  return (
    <div className="p-4 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-2">History</h1>
      
      {resultState && (
        <VerificationResult 
          confirmed={resultState.confirmed} 
          confidence={resultState.confidence} 
        />
      )}

      {!store.isLoading && (
        <WeeklyChart data={store.weeklyHistory} />
      )}
      
      {store.isLoading && (
        <div className="p-8 font-bold text-center w-full mt-4">
          Loading history...
        </div>
      )}
    </div>
  )
}
