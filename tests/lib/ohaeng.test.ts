// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { computeOhaeng } from '@/lib/ohaeng'
import type { SelectedSurname, HanjaEntry } from '@/lib/types'

describe('computeOhaeng', () => {
  // Test 1 — 자원오행 상생 (水→木→火)
  it('자원오행 상생: 水→木→火 (임영욱)', () => {
    const surname: SelectedSurname = {
      reading: '임', char: '林', stroke: 8, ohaeng: '水',
    }
    const chars: HanjaEntry[] = [
      { char: '英', stroke: 8, ohaeng: '木', reading: '영', meaning: '꽃부리', gender: 'neutral', positive: true },
      { char: '昱', stroke: 9, ohaeng: '火', reading: '욱', meaning: '빛나다', gender: 'male', positive: true },
    ]
    const result = computeOhaeng(surname, chars)

    expect(result.jawi).toEqual(['水', '木', '火'])
    expect(result.jawiSangsaeng).toBe(true)   // 水→木→火 모두 상생
  })

  // Test 2 — 발음오행 불상생 (木→金 아님)
  it('발음오행 불상생: 김(ㄱ=木) → 수(ㅅ=金) — 木→金 아님', () => {
    const surname2: SelectedSurname = {
      reading: '김', char: '金', stroke: 8, ohaeng: '金',
    }
    const chars2: HanjaEntry[] = [
      { char: '秀', stroke: 7, ohaeng: '木', reading: '수', meaning: '빼어나다', gender: 'neutral', positive: true },
    ]
    const result2 = computeOhaeng(surname2, chars2)

    // 김=ㄱ→木, 수=ㅅ→金
    expect(result2.balpum).toEqual(['木', '金'])
    expect(result2.balpumSangsaeng).toBe(false)  // 木→金은 상생 아님 (木→火가 상생)
  })

  // Test 3 — 발음오행 상생 true (木→火)
  it('발음오행 상생: 강(ㄱ=木) → 나(ㄴ=火) — 木→火 상생', () => {
    const surname3: SelectedSurname = {
      reading: '강', char: '姜', stroke: 9, ohaeng: '土',
    }
    const chars3: HanjaEntry[] = [
      { char: '仁', stroke: 4, ohaeng: '木', reading: '나', meaning: '어질다', gender: 'neutral', positive: true },
    ]
    const result3 = computeOhaeng(surname3, chars3)

    // 강=ㄱ→木, 나=ㄴ→火: 木→火 상생
    expect(result3.balpum).toEqual(['木', '火'])
    expect(result3.balpumSangsaeng).toBe(true)
  })

  // Test 4 — 1자 이름: jawi/balpum 길이 2
  it('1자 이름: jawi/balpum 배열 길이가 2', () => {
    const result4 = computeOhaeng(
      { reading: '이', char: '李', stroke: 7, ohaeng: '木' },
      [{ char: '英', stroke: 8, ohaeng: '木', reading: '영', meaning: '꽃부리', gender: 'neutral', positive: true }],
    )

    expect(result4.jawi).toHaveLength(2)
    expect(result4.balpum).toHaveLength(2)
  })

  // Test 5 — 2자 이름: jawi/balpum 길이 3
  it('2자 이름: jawi/balpum 배열 길이가 3', () => {
    const result5 = computeOhaeng(
      { reading: '박', char: '朴', stroke: 6, ohaeng: '木' },
      [
        { char: '志', stroke: 7, ohaeng: '火', reading: '지', meaning: '뜻', gender: 'neutral', positive: true },
        { char: '恩', stroke: 10, ohaeng: '土', reading: '은', meaning: '은혜', gender: 'female', positive: true },
      ],
    )

    expect(result5.jawi).toHaveLength(3)
    expect(result5.balpum).toHaveLength(3)
  })

  // Test 6 — 자원오행 불상생 검증
  it('자원오행 불상생: 金→木→火 (金→木 아님)', () => {
    const result6 = computeOhaeng(
      { reading: '김', char: '金', stroke: 8, ohaeng: '金' },
      [
        { char: '英', stroke: 8, ohaeng: '木', reading: '영', meaning: '꽃부리', gender: 'neutral', positive: true },
        { char: '昱', stroke: 9, ohaeng: '火', reading: '욱', meaning: '빛나다', gender: 'male', positive: true },
      ],
    )

    expect(result6.jawi).toEqual(['金', '木', '火'])
    expect(result6.jawiSangsaeng).toBe(false)  // 金→木은 상생 아님 (金→水가 상생)
  })

  // Test 7 — 발음오행 매핑 전체 순환 검증 (水→木)
  it('발음오행 상생: 민(ㅁ=水) → 강(ㄱ=木) — 水→木 상생', () => {
    const result7 = computeOhaeng(
      { reading: '민', char: '閔', stroke: 12, ohaeng: '水' },
      [
        { char: '姜', stroke: 9, ohaeng: '土', reading: '강', meaning: '강', gender: 'neutral', positive: true },
      ],
    )

    // 민=ㅁ→水, 강=ㄱ→木
    expect(result7.balpum).toEqual(['水', '木'])
    expect(result7.balpumSangsaeng).toBe(true)  // 水→木 상생
  })

  // Test 8 — 오행 매핑 개별 검증
  it('발음오행 초성 매핑: ㅂ→水, ㅍ→水, ㄷ→火, ㅌ→火, ㅈ→金, ㅊ→金', () => {
    // 박(ㅂ)→水
    const r1 = computeOhaeng(
      { reading: '박', char: '朴', stroke: 6, ohaeng: '木' },
      [{ char: '仁', stroke: 4, ohaeng: '木', reading: '다', meaning: '다', gender: 'neutral', positive: true }],
    )
    expect(r1.balpum[0]).toBe('水')  // 박=ㅂ→水
    expect(r1.balpum[1]).toBe('火')  // 다=ㄷ→火

    // 최(ㅊ)→金
    const r2 = computeOhaeng(
      { reading: '최', char: '崔', stroke: 11, ohaeng: '土' },
      [{ char: '仁', stroke: 4, ohaeng: '木', reading: '지', meaning: '지', gender: 'neutral', positive: true }],
    )
    expect(r2.balpum[0]).toBe('金')  // 최=ㅊ→金
    expect(r2.balpum[1]).toBe('金')  // 지=ㅈ→金
  })
})
