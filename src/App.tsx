import { useNameStore } from './stores/nameStore'
import { InputForm } from './components/InputForm'
import SajuDisplay from './components/SajuDisplay'
import ResultCard from './components/ResultCard'

function App() {
  const { result, reset } = useNameStore()

  return (
    <div className="min-h-screen bg-[#FAFAF8] py-8 px-4">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-3xl font-serif text-gray-900">
          <span className="text-gold">작</span>명소
        </h1>
        <p className="text-gray-500 mt-1 text-sm">아기 이름을 지어드립니다</p>
      </header>

      {/* Main */}
      <main className="max-w-lg mx-auto">
        {result.isLoading ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-2xl mb-2">✦</div>
            <p>이름을 생성하는 중입니다...</p>
          </div>
        ) : result.candidates.length > 0 ? (
          <div className="space-y-4">
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
          </div>
        ) : (
          <InputForm />
        )}
      </main>
    </div>
  )
}

export default App
