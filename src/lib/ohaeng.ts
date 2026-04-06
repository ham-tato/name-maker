import type { Ohaeng, SelectedSurname, HanjaEntry, OhaengResult } from './types'

// 초성 배열 (유니코드 한글 분해 순서)
const CHOSEONG = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'] as const

// 초성 → 발음오행 매핑
const CHOSEONG_TO_OHAENG: Record<string, Ohaeng> = {
  'ㄱ': '木', 'ㅋ': '木',
  'ㄴ': '火', 'ㄷ': '火', 'ㄹ': '火', 'ㅌ': '火',
  'ㅇ': '土', 'ㅎ': '土',
  'ㅅ': '金', 'ㅈ': '金', 'ㅊ': '金',
  'ㅁ': '水', 'ㅂ': '水', 'ㅍ': '水',
}

// 상생 관계: A → B (A가 B를 생함)
const SAENG: Record<Ohaeng, Ohaeng> = {
  '木': '火',
  '火': '土',
  '土': '金',
  '金': '水',
  '水': '木',
}

/** A가 B를 생하는가? */
function generates(a: Ohaeng, b: Ohaeng): boolean {
  return SAENG[a] === b
}

/** 배열의 인접한 모든 쌍이 상생인지 판정 */
function isSangsaeng(ohaengs: Ohaeng[]): boolean {
  for (let i = 0; i < ohaengs.length - 1; i++) {
    if (!generates(ohaengs[i], ohaengs[i + 1])) return false
  }
  return true
}

/**
 * 한글 독음에서 초성 자음을 추출한다.
 * 독음이 여러 글자일 경우 첫 글자의 초성만 사용한다.
 */
function extractChoseong(reading: string): string | null {
  const first = reading[0]
  if (!first) return null
  const code = first.charCodeAt(0)
  if (code < 0xAC00 || code > 0xD7A3) return null
  const index = Math.floor((code - 0xAC00) / 588)
  return CHOSEONG[index] ?? null
}

/**
 * 한글 독음에서 발음오행을 반환한다.
 * 매핑 불가 시 null 반환.
 */
function toBalpumOhaeng(reading: string): Ohaeng | null {
  const cho = extractChoseong(reading)
  if (!cho) return null
  return CHOSEONG_TO_OHAENG[cho] ?? null
}

/**
 * 자원오행 및 발음오행 상생 판정.
 *
 * @param surname - 선택된 성씨 (1자)
 * @param chars   - 이름 한자 목록 (1~2자)
 * @returns OhaengResult
 */
export function computeOhaeng(
  surname: SelectedSurname,
  chars: HanjaEntry[]
): OhaengResult {
  // 자원오행: 각 한자의 ohaeng 필드를 순서대로 수집
  const jawi: Ohaeng[] = [surname.ohaeng, ...chars.map(c => c.ohaeng)]

  // 발음오행: 각 글자 독음의 초성으로 수집
  const surnameBalp = toBalpumOhaeng(surname.reading)
  const charsBalp = chars.map(c => toBalpumOhaeng(c.reading))

  // null 값 없이 모두 유효한 경우에만 배열 구성 (실제 데이터에서는 항상 유효해야 함)
  const balpum: Ohaeng[] = [
    surnameBalp ?? surname.ohaeng,  // 폴백: 자원오행 사용
    ...charsBalp.map((b, i) => b ?? chars[i].ohaeng),
  ]

  return {
    jawi,
    jawiSangsaeng: isSangsaeng(jawi),
    balpum,
    balpumSangsaeng: isSangsaeng(balpum),
  }
}
