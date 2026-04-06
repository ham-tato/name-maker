// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { generateNames } from '@/lib/generator'
import type { InputState, Ohaeng } from '@/lib/types'

const baseInput: InputState = {
  birthdate: '2000-01-01',
  birthHour: null,
  gender: 'neutral',
  surnameReading: '김',
  selectedSurname: { reading: '김', char: '金', stroke: 8, ohaeng: '金' },
  nameLength: 2,
}
const yongsin: Ohaeng[] = ['水', '木']

describe('generateNames — 이름 생성 엔진', () => {
  it('Test 1 — 기본 실행, 배열 반환', () => {
    const result = generateNames(baseInput, yongsin)
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
    expect(result.length).toBeLessThanOrEqual(5)
  })

  it('Test 2 — selectedSurname이 null이면 빈 배열', () => {
    const nullInput = { ...baseInput, selectedSurname: null }
    expect(generateNames(nullInput, yongsin)).toEqual([])
  })

  it('Test 3 — NameCandidate 구조 확인', () => {
    const result = generateNames(baseInput, yongsin)
    if (result.length > 0) {
      const first = result[0]
      expect(first.surname).toBeDefined()
      expect(first.chars).toBeDefined()
      expect(typeof first.fullReading).toBe('string')
      expect(typeof first.fullHanja).toBe('string')
      expect(typeof first.score).toBe('number')
      expect(typeof first.relaxed).toBe('boolean')
      expect(first.suri).toBeDefined()
      expect(first.ohaeng).toBeDefined()
      expect(first.eumyang).toBeDefined()
      expect(first.naturalness).toBeDefined()
    }
  })

  it('Test 4 — 점수 내림차순 정렬', () => {
    const result = generateNames(baseInput, yongsin)
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].score).toBeGreaterThanOrEqual(result[i + 1].score)
    }
  })

  it('Test 5 — gender 필터 (male 이름에는 female 한자 없음)', () => {
    const maleInput = { ...baseInput, gender: 'male' as const, nameLength: 1 as const }
    const maleResult = generateNames(maleInput, yongsin)
    maleResult.forEach(c => {
      c.chars.forEach(ch => {
        expect(ch.gender).not.toBe('female')
      })
    })
  })

  it('Test 6 — 1자 이름 (chars 길이 1)', () => {
    const oneCharInput = { ...baseInput, nameLength: 1 as const }
    const result = generateNames(oneCharInput, yongsin)
    result.forEach(c => {
      expect(c.chars).toHaveLength(1)
    })
  })

  it('Test 7 — positive 필터 (모든 후보 positive=true)', () => {
    const result = generateNames(baseInput, yongsin)
    result.forEach(c => {
      c.chars.forEach(ch => {
        expect(ch.positive).toBe(true)
      })
    })
  })

  it('Test 8 — naturalness 필터 (모든 후보 isNatural=true)', () => {
    const result = generateNames(baseInput, yongsin)
    result.forEach(c => {
      expect(c.naturalness.isNatural).toBe(true)
    })
  })
})
