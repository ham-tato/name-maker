import hanjaData from '../data/hanja.json'
import { computeSuri } from './suri'
import { computeOhaeng } from './ohaeng'
import { computeEumyang } from './eumyang'
import { checkNaturalness } from './naturalness'
import type { InputState, NameCandidate, HanjaEntry, Ohaeng, SelectedSurname } from './types'

const ALL_HANJA: HanjaEntry[] = hanjaData as HanjaEntry[]

function buildCandidate(
  surname: SelectedSurname,
  chars: HanjaEntry[],
  yongsin: Ohaeng[],
  relaxed: boolean
): NameCandidate {
  const suri = computeSuri(surname, chars)
  const ohaeng = computeOhaeng(surname, chars)
  const eumyang = computeEumyang(surname, chars)
  const naturalness = checkNaturalness(surname, chars)
  const yongsinIncluded = ohaeng.jawi.some(o => yongsin.includes(o))
  const score = [
    naturalness.isNatural,
    suri.isAllGil,
    yongsinIncluded,
    ohaeng.jawiSangsaeng,
    ohaeng.balpumSangsaeng,
    eumyang.isBalanced,
  ].filter(Boolean).length
  return {
    surname,
    chars,
    fullReading: surname.reading + chars.map(c => c.reading).join(''),
    fullHanja: surname.char + chars.map(c => c.char).join(''),
    meaning: chars.map(c => c.meaning).join(' '),
    suri,
    ohaeng,
    eumyang,
    naturalness,
    yongsinIncluded,
    score,
    relaxed,
  }
}

export function generateNames(input: InputState, yongsin: Ohaeng[]): NameCandidate[] {
  if (!input.selectedSurname) return []
  const surname = input.selectedSurname

  // 1단계 [필수]: positive=true인 한자만 사용
  // 2단계 [필수]: gender 필터
  const filtered = ALL_HANJA.filter(h => {
    if (!h.positive) return false
    if (input.gender === 'male' && h.gender === 'female') return false
    if (input.gender === 'female' && h.gender === 'male') return false
    return true
  })

  // 조합 생성
  const combos: HanjaEntry[][] = input.nameLength === 1
    ? filtered.map(h => [h])
    : filtered.flatMap(h1 => filtered.filter(h2 => h2 !== h1).map(h2 => [h1, h2]))

  // 3단계 [필수]: 자연스러움 필터 포함하여 모든 후보 빌드
  const allCandidates = combos
    .map(chars => buildCandidate(surname, chars, yongsin, false))
    .filter(c => c.naturalness.isNatural)

  // 4-8단계 완화 시도
  // stageFilters[0] = 4단계(수리), [1] = 5단계(용신), [2] = 6단계(자원오행), [3] = 7단계(발음오행), [4] = 8단계(음양)
  const stageFilters = [
    (c: NameCandidate) => c.suri.isAllGil,
    (c: NameCandidate) => c.yongsinIncluded,
    (c: NameCandidate) => c.ohaeng.jawiSangsaeng,
    (c: NameCandidate) => c.ohaeng.balpumSangsaeng,
    (c: NameCandidate) => c.eumyang.isBalanced,
  ]

  // 시도 1~6: numStages를 5에서 0까지 줄여가며 5개 이상이면 반환
  for (let numStages = 5; numStages >= 0; numStages--) {
    const activeFns = stageFilters.slice(0, numStages)
    const result = allCandidates.filter(c => activeFns.every(fn => fn(c)))
    if (result.length >= 5) {
      const relaxed = numStages < 5
      return result
        .map(c => ({ ...c, relaxed }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
    }
  }

  // 폴백: 전체를 점수순 정렬 후 5개 반환 (relaxed=true)
  return allCandidates
    .map(c => ({ ...c, relaxed: true }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
}
