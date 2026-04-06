// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { computeEumyang } from '@/lib/eumyang'
import type { SelectedSurname, HanjaEntry } from '@/lib/types'

describe('computeEumyang', () => {
  // Test 1 — 양음 균형 (성 짝수획=음, 이름 홀수획=양)
  it('양음 균형: 김(8획=음) + 민(5획=양)', () => {
    const surname: SelectedSurname = {
      reading: '김',
      char: '金',
      stroke: 8,
      ohaeng: '金',
    }
    const chars1: HanjaEntry[] = [
      {
        char: '民',
        stroke: 5,
        ohaeng: '水',
        reading: '민',
        meaning: '백성',
        gender: 'neutral',
        positive: true,
      },
    ]
    const result1 = computeEumyang(surname, chars1)
    expect(result1.pattern).toEqual(['음', '양'])
    expect(result1.isBalanced).toBe(true)
  })

  // Test 2 — 양양 불균형
  it('양양 불균형: 이(7획=양) + 용(9획=양)', () => {
    const surname2: SelectedSurname = {
      reading: '이',
      char: '李',
      stroke: 7,
      ohaeng: '木',
    }
    const chars2: HanjaEntry[] = [
      {
        char: '勇',
        stroke: 9,
        ohaeng: '土',
        reading: '용',
        meaning: '용감하다',
        gender: 'male',
        positive: true,
      },
    ]
    const result2 = computeEumyang(surname2, chars2)
    expect(result2.pattern).toEqual(['양', '양'])
    expect(result2.isBalanced).toBe(false)
  })

  // Test 3 — 3자 이름 균형 (음양음)
  it('3자 이름 균형: 김(8획=음) + 준(9획=양) + 영(8획=음)', () => {
    const surname3: SelectedSurname = {
      reading: '김',
      char: '金',
      stroke: 8,
      ohaeng: '金',
    }
    const chars3: HanjaEntry[] = [
      {
        char: '俊',
        stroke: 9,
        ohaeng: '水',
        reading: '준',
        meaning: '준걸',
        gender: 'male',
        positive: true,
      },
      {
        char: '英',
        stroke: 8,
        ohaeng: '木',
        reading: '영',
        meaning: '꽃부리',
        gender: 'neutral',
        positive: true,
      },
    ]
    const result3 = computeEumyang(surname3, chars3)
    expect(result3.pattern).toEqual(['음', '양', '음'])
    expect(result3.isBalanced).toBe(true)
  })

  // Test 4 — 3자 이름 모두 양 → 불균형
  it('3자 이름 불균형: 이(7획=양) + 민(5획=양) + 용(9획=양)', () => {
    const surname4: SelectedSurname = {
      reading: '이',
      char: '李',
      stroke: 7,
      ohaeng: '木',
    }
    const chars4: HanjaEntry[] = [
      {
        char: '民',
        stroke: 5,
        ohaeng: '水',
        reading: '민',
        meaning: '백성',
        gender: 'neutral',
        positive: true,
      },
      {
        char: '勇',
        stroke: 9,
        ohaeng: '土',
        reading: '용',
        meaning: '용감하다',
        gender: 'male',
        positive: true,
      },
    ]
    const result4 = computeEumyang(surname4, chars4)
    expect(result4.pattern).toEqual(['양', '양', '양'])
    expect(result4.isBalanced).toBe(false)
  })
})
