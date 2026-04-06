import type { SelectedSurname, HanjaEntry, EumyangResult } from './types'

/**
 * 획수의 음양을 판정
 * 홀수 → 양(陽), 짝수 → 음(陰)
 */
function toEumyang(stroke: number): '양' | '음' {
  return stroke % 2 === 1 ? '양' : '음'
}

/**
 * 음양 배합(陰陽配合) 판정
 *
 * @param surname - 선택된 성씨
 * @param chars - 이름 글자 배열 (1~2자)
 * @returns EumyangResult - 패턴과 균형 여부
 *
 * 알고리즘:
 * 1. 성씨 획수 + 이름 글자들 획수를 각각 음양으로 변환
 * 2. 패턴 배열 생성 (성 + 이름 순서)
 * 3. isBalanced: 패턴에 '양'이 적어도 하나, '음'이 적어도 하나 포함되면 true
 *    - 모두 양 또는 모두 음이면 false
 */
export function computeEumyang(
  surname: SelectedSurname,
  chars: HanjaEntry[],
): EumyangResult {
  // 패턴 생성: 성 + 이름 글자들
  const pattern: ('양' | '음')[] = [
    toEumyang(surname.stroke),
    ...chars.map((char) => toEumyang(char.stroke)),
  ]

  // 균형 판정: 양과 음이 모두 포함되어야 함
  const hasYang = pattern.includes('양')
  const hasEum = pattern.includes('음')
  const isBalanced = hasYang && hasEum

  return {
    pattern,
    isBalanced,
  }
}
