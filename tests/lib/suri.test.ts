// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { computeSuri } from '@/lib/suri'
import type { SelectedSurname, HanjaEntry } from '@/lib/types'

describe('computeSuri — 수리성명학 4格 계산', () => {
  it('Test 1 — 김(8획) + 민(5획) 1자 이름', () => {
    const surname: SelectedSurname = { reading: '김', char: '金', stroke: 8, ohaeng: '金' }
    const chars: HanjaEntry[] = [
      { char: '民', stroke: 5, ohaeng: '水', reading: '민', meaning: '백성', gender: 'neutral', positive: true },
    ]
    const result = computeSuri(surname, chars)

    // 원격: 5 (이름 첫 글자)
    // 형격: 8 + 5 = 13
    // 이격: 5 (이름 전체, 1자)
    // 정격: 8 + 5 = 13
    expect(result.won).toBe(5)
    expect(result.hyeong).toBe(13)
    expect(result.i).toBe(5)
    expect(result.jeong).toBe(13)
    expect(result.wonLuck).toBeDefined()
    expect(result.isAllGil).toBeTypeOf('boolean')
  })

  it('Test 2 — 이(7획) + 준(9획)민(5획) 2자 이름', () => {
    const surname2: SelectedSurname = { reading: '이', char: '李', stroke: 7, ohaeng: '木' }
    const chars2: HanjaEntry[] = [
      { char: '俊', stroke: 9, ohaeng: '水', reading: '준', meaning: '준걸', gender: 'male', positive: true },
      { char: '民', stroke: 5, ohaeng: '水', reading: '민', meaning: '백성', gender: 'neutral', positive: true },
    ]
    const result2 = computeSuri(surname2, chars2)

    // 원격: 9 (이름 첫 글자)
    // 형격: 7 + 9 = 16
    // 이격: 9 + 5 = 14
    // 정격: 7 + 9 + 5 = 21
    expect(result2.won).toBe(9)
    expect(result2.hyeong).toBe(16)
    expect(result2.i).toBe(14)
    expect(result2.jeong).toBe(21)
  })

  it('Test 3 — 정격 81 초과 처리 (82 → 나머지 1)', () => {
    // 성 획수 + 이름 합 = 82 → 나머지 1
    const bigSurname: SelectedSurname = { reading: '테스트', char: '大', stroke: 40, ohaeng: '土' }
    const bigChars: HanjaEntry[] = [
      { char: '宇', stroke: 42, ohaeng: '土', reading: '우', meaning: '집', gender: 'male', positive: true },
    ]
    const result3 = computeSuri(bigSurname, bigChars)

    // 정격: (40 + 42) = 82 → 82 % 81 = 1
    expect(result3.jeong).toBe(1)
  })

  it('Test 4 — 정격이 정확히 81인 경우 81 유지', () => {
    // 성+이름 = 81 → 81 유지
    const s81: SelectedSurname = { reading: '테', char: '大', stroke: 40, ohaeng: '土' }
    const c81: HanjaEntry[] = [
      { char: '宇', stroke: 41, ohaeng: '土', reading: '우', meaning: '집', gender: 'male', positive: true },
    ]
    const result4 = computeSuri(s81, c81)

    expect(result4.jeong).toBe(81)
  })

  it('81수리 조회 결과 구조 검증', () => {
    const surname: SelectedSurname = { reading: '박', char: '朴', stroke: 6, ohaeng: '木' }
    const chars: HanjaEntry[] = [
      { char: '智', stroke: 12, ohaeng: '水', reading: '지', meaning: '지혜', gender: 'neutral', positive: true },
      { char: '宇', stroke: 6, ohaeng: '土', reading: '우', meaning: '하늘', gender: 'male', positive: true },
    ]
    const result = computeSuri(surname, chars)

    // 각 Luck 항목이 올바른 구조를 가지는지 검증
    for (const luckEntry of [result.wonLuck, result.hyeongLuck, result.iLuck, result.jeongLuck]) {
      expect(luckEntry).toHaveProperty('name')
      expect(luckEntry).toHaveProperty('luck')
      expect(luckEntry).toHaveProperty('desc')
      expect(['대길', '길', '반길', '흉', '대흉']).toContain(luckEntry.luck)
    }
  })

  it('isAllGil 판정 — 4格 모두 길격이면 true', () => {
    // 원격=5(대길), 형격=13(길), 이격=5(대길), 정격=13(길) → 모두 길
    const surname: SelectedSurname = { reading: '김', char: '金', stroke: 8, ohaeng: '金' }
    const chars: HanjaEntry[] = [
      { char: '民', stroke: 5, ohaeng: '水', reading: '민', meaning: '백성', gender: 'neutral', positive: true },
    ]
    const result = computeSuri(surname, chars)

    // 5: 대길, 13: 길, 5: 대길, 13: 길 → isAllGil = true
    expect(result.isAllGil).toBe(true)
  })
})
