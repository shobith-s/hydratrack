import { CheckCircle2, XCircle } from 'lucide-react'

export function VerificationResult({ confirmed, confidence }: { confirmed: boolean, confidence: number }) {
  const percentage = Math.round(confidence * 100)

  if (confirmed) {
    return (
      <div className="neo-card bg-[#00DFA2] flex flex-col items-center justify-center p-6 mt-4 w-full text-center">
        <CheckCircle2 size={48} className="mb-2" />
        <h2 className="text-2xl font-bold mb-1">Drink Verified!</h2>
        <p className="font-semibold text-sm">+250 ml logged to your goal.</p>
        <p className="text-xs font-bold mt-4 opacity-80 backdrop-blur-sm bg-black/10 px-2 py-1 rounded-full neo-border">
          AI Confidence: {percentage}%
        </p>
      </div>
    )
  }

  return (
    <div className="neo-card bg-[#FF0060] text-white flex flex-col items-center justify-center p-6 mt-4 w-full text-center">
      <XCircle size={48} className="mb-2 text-white" />
      <h2 className="text-2xl font-bold mb-1">Verification failed</h2>
      <p className="font-semibold text-sm">We couldn't clearly see a drink recorded.</p>
      <p className="text-xs font-bold mt-4 opacity-80 backdrop-blur-sm bg-black/20 px-2 py-1 rounded-full neo-border">
        AI Confidence: {percentage}% (needs &ge; 55%)
      </p>
    </div>
  )
}
