import { useState } from 'react'
import ScoreBadge from './ScoreBadge'
import type { NameCandidate } from '../lib/types'
import { OHAENG_HEX } from '../lib/constants'

interface ResultCardProps {
  candidate: NameCandidate
  rank: number
}

function luckColor(luck: string): string {
  if (luck === '대길' || luck === '길') return 'text-gold'
  if (luck === '반길') return 'text-yellow-600'
  if (luck === '흉') return 'text-orange-500'
  return 'text-red-600'
}

export default function ResultCard({ candidate, rank }: ResultCardProps) {
  const [expanded, setExpanded] = useState(false)
  const { suri, ohaeng, eumyang, naturalness } = candidate

  const surnamePart = candidate.fullHanja.slice(0, 1)
  const namePart = candidate.fullHanja.slice(1)

  return (
    <div
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer"
      onClick={() => setExpanded((v) => !v)}
    >
      {/* 접힌 상태 */}
      <div className="flex items-start gap-3">
        {/* 순위 뱃지 */}
        <span className="text-gold font-bold text-lg min-w-[1.5rem] text-center">{rank}</span>

        {/* 이름 정보 */}
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            {/* 한자 */}
            <span className="font-serif text-3xl">
              <span className="text-gray-500">{surnamePart}</span>
              <span className="text-gray-900">{namePart}</span>
            </span>
            {/* 독음 */}
            <span className="text-lg font-medium text-gray-700">{candidate.fullReading}</span>
          </div>

          {/* 뜻 */}
          <p className="text-sm text-gray-500 mt-0.5">{candidate.meaning}</p>

          {/* ScoreBadge 6개 */}
          <div className="flex flex-wrap gap-1 mt-2">
            <ScoreBadge label="수리" passed={suri.isAllGil} />
            <ScoreBadge label="용신" passed={candidate.yongsinIncluded} />
            <ScoreBadge label="자원오행" passed={ohaeng.jawiSangsaeng} />
            <ScoreBadge label="발음오행" passed={ohaeng.balpumSangsaeng} />
            <ScoreBadge label="음양" passed={eumyang.isBalanced} />
            <ScoreBadge label="자연" passed={naturalness.isNatural} />
          </div>

          {/* 점수 */}
          <p className="text-xs text-gray-400 mt-1">점수: {candidate.score}/6</p>
        </div>

        {/* 펼침 토글 버튼 */}
        <span className="text-gray-400 text-sm mt-1 select-none">
          {expanded ? '▲' : '▼'}
        </span>
      </div>

      {/* 펼친 상태 추가 정보 */}
      {expanded && (
        <div
          className="mt-4 border-t border-gray-100 pt-4 space-y-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 수리 4격 표 */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">수리 4격</p>
            <div className="grid grid-cols-4 gap-2 text-center text-sm">
              {(
                [
                  { label: '원격', num: suri.won, luck: suri.wonLuck },
                  { label: '형격', num: suri.hyeong, luck: suri.hyeongLuck },
                  { label: '이격', num: suri.i, luck: suri.iLuck },
                  { label: '정격', num: suri.jeong, luck: suri.jeongLuck },
                ] as const
              ).map(({ label, num, luck }) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <span className="text-xs text-gray-400">{label}</span>
                  <span className="font-bold text-gray-900">{num}</span>
                  <span className="text-xs text-gray-600">{luck.name}</span>
                  <span className={`text-xs font-medium ${luckColor(luck.luck)}`}>
                    {luck.luck}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 오행 흐름 */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">오행 흐름</p>
            <div className="space-y-1">
              {/* 자원오행 */}
              <div className="flex items-center gap-1 text-sm">
                <span className="text-xs text-gray-400 w-16">자원오행:</span>
                {ohaeng.jawi.map((o, i) => (
                  <span key={i}>
                    <span style={{ color: OHAENG_HEX[o] }} className="font-medium">{o}</span>
                    {i < ohaeng.jawi.length - 1 && (
                      <span className="text-gray-400 mx-0.5">→</span>
                    )}
                  </span>
                ))}
                <span className="ml-1 text-xs text-gray-500">
                  (상생: {ohaeng.jawiSangsaeng ? '✓' : '✗'})
                </span>
              </div>

              {/* 발음오행 */}
              <div className="flex items-center gap-1 text-sm">
                <span className="text-xs text-gray-400 w-16">발음오행:</span>
                {ohaeng.balpum.map((o, i) => (
                  <span key={i}>
                    <span style={{ color: OHAENG_HEX[o] }} className="font-medium">{o}</span>
                    {i < ohaeng.balpum.length - 1 && (
                      <span className="text-gray-400 mx-0.5">→</span>
                    )}
                  </span>
                ))}
                <span className="ml-1 text-xs text-gray-500">
                  (상생: {ohaeng.balpumSangsaeng ? '✓' : '✗'})
                </span>
              </div>
            </div>
          </div>

          {/* 음양 패턴 */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">음양배합</p>
            <div className="flex items-center gap-1 text-sm">
              {eumyang.pattern.map((p, i) => (
                <span key={i} className={p === '양' ? 'text-gold font-medium' : 'text-blue-400 font-medium'}>
                  {p}
                </span>
              ))}
              <span className="ml-1 text-xs text-gray-500">
                (균형: {eumyang.isBalanced ? '✓' : '✗'})
              </span>
            </div>
          </div>

          {/* 조건 완화 표시 */}
          {candidate.relaxed && (
            <p className="text-xs text-gray-400">* 조건 완화 적용</p>
          )}
        </div>
      )}
    </div>
  )
}
