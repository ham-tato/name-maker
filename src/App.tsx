import { useNameStore } from './stores/nameStore'
import { StepForm } from './components/StepForm'
import SajuDisplay from './components/SajuDisplay'
import ResultCard from './components/ResultCard'

function App() {
  const { result, reset } = useNameStore()

  if (result.isLoading) {
    return (
      <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center">
        <div className="text-gold text-4xl mb-4 animate-pulse">✦</div>
        <p className="text-white/50 text-sm">이름을 짓고 있습니다...</p>
      </div>
    )
  }

  if (result.candidates.length > 0) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] py-8 px-4">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-serif text-gray-900">
            <span className="text-gold">작</span>명소
          </h1>
        </header>
        <main className="max-w-lg mx-auto space-y-4">
          {result.saju && (
            <SajuDisplay saju={result.saju} yongsin={result.yongsin} />
          )}
          {result.candidates.map((candidate, i) => (
            <ResultCard key={candidate.fullHanja + i} candidate={candidate} rank={i + 1} />
          ))}
          <div className="text-center pt-4">
            <button onClick={reset} className="text-sm text-gray-500 hover:text-gray-700 underline">
              다시 입력하기
            </button>
          </div>
        </main>
      </div>
    )
  }

  return <StepForm />
}

export default App
