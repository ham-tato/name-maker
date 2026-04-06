import type { SelectedSurname, HanjaEntry, NaturalnessResult } from './types'

// 종성(받침) 배열 — 인덱스 0은 받침 없음
const JONGSEONG = [
  '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ',
  'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ',
  'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
] as const

// 초성 배열 — 유니코드 한글 분해 순서
const CHOSEONG = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ',
  'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
] as const

// 어색한 받침+초성 조합 (종성:초성)
const AWKWARD_PAIRS = new Set([
  'ㄱ:ㄱ', 'ㄷ:ㄷ', 'ㅂ:ㅂ', 'ㄴ:ㄴ', 'ㅁ:ㅁ', 'ㅅ:ㅅ', 'ㅈ:ㅈ',
  'ㅇ:ㅇ',
  'ㄱ:ㄴ', 'ㄷ:ㄴ', 'ㅂ:ㄴ', 'ㅇ:ㄴ',
])

/** 한글 음절에서 종성(받침)을 추출한다. 받침 없으면 빈 문자열 반환. */
function extractJongseong(syllable: string): string {
  const code = syllable.charCodeAt(0)
  if (code < 0xAC00 || code > 0xD7A3) return ''
  const jongIndex = (code - 0xAC00) % 28
  return JONGSEONG[jongIndex]
}

/** 한글 음절에서 초성을 추출한다. 한글 범위 밖이면 빈 문자열 반환. */
function extractChoseong(syllable: string): string {
  const code = syllable.charCodeAt(0)
  if (code < 0xAC00 || code > 0xD7A3) return ''
  return CHOSEONG[Math.floor((code - 0xAC00) / 588)]
}

/**
 * 반복 음절 검사 — 동일 음절이 두 번 이상 나오면 false.
 */
function checkNoRepeat(syllables: string[]): boolean {
  return new Set(syllables).size === syllables.length
}

/**
 * 받침+초성 충돌 검사 — 인접한 쌍 중 AWKWARD_PAIRS에 해당하면 false.
 */
function checkFlowsWell(syllables: string[]): boolean {
  for (let i = 0; i < syllables.length - 1; i++) {
    const jong = extractJongseong(syllables[i])
    if (!jong) continue  // 받침 없으면 충돌 없음
    const cho = extractChoseong(syllables[i + 1])
    if (AWKWARD_PAIRS.has(`${jong}:${cho}`)) return false
  }
  return true
}

/**
 * 이름의 발음 자연스러움을 판정한다.
 *
 * @param surname - 선택된 성씨
 * @param chars   - 이름 한자 목록 (1~2자)
 * @returns NaturalnessResult
 */
export function checkNaturalness(
  surname: SelectedSurname,
  chars: HanjaEntry[],
): NaturalnessResult {
  const syllables = [surname.reading, ...chars.map(c => c.reading)]
  const noRepeat = checkNoRepeat(syllables)
  const flowsWell = checkFlowsWell(syllables)
  return { noRepeat, flowsWell, isNatural: noRepeat && flowsWell }
}
