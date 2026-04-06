// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { checkNaturalness } from '@/lib/naturalness'
import type { SelectedSurname, HanjaEntry } from '@/lib/types'

function makeSurname(reading: string): SelectedSurname {
  return { reading, char: '金', stroke: 8, ohaeng: '金' }
}

function makeChar(reading: string): HanjaEntry {
  return { char: '民', stroke: 5, ohaeng: '水', reading, meaning: '테스트', gender: 'neutral', positive: true }
}

describe('checkNaturalness', () => {
  // Test 1 — 자연스러운 이름 (반복 없음, 받침 없어 충돌 없음)
  it('자연스러운 이름: 이+준+수 (받침 없음, 중복 없음)', () => {
    const result = checkNaturalness(makeSurname('이'), [makeChar('준'), makeChar('수')])
    expect(result.noRepeat).toBe(true)
    expect(result.flowsWell).toBe(true)
    expect(result.isNatural).toBe(true)
  })

  // Test 2 — 반복 음절 (성=이름 첫 글자)
  it('반복 음절: 민+민 → noRepeat=false', () => {
    const result = checkNaturalness(makeSurname('민'), [makeChar('민')])
    expect(result.noRepeat).toBe(false)
    expect(result.isNatural).toBe(false)
  })

  // Test 3 — 반복 음절 (이름 2자 중 중복)
  it('반복 음절: 이+준+준 → noRepeat=false', () => {
    const result = checkNaturalness(makeSurname('이'), [makeChar('준'), makeChar('준')])
    expect(result.noRepeat).toBe(false)
    expect(result.isNatural).toBe(false)
  })

  // Test 4 — 받침+초성 충돌 (ㄱ:ㄱ)
  it('충돌: 박(ㄱ받침)+규(ㄱ초성) → ㄱ:ㄱ → flowsWell=false', () => {
    const result = checkNaturalness(makeSurname('박'), [makeChar('규')])
    expect(result.flowsWell).toBe(false)
    expect(result.isNatural).toBe(false)
  })

  // Test 5 — 받침 없으면 충돌 없음
  it('받침 없음: 이+나 → flowsWell=true', () => {
    const result = checkNaturalness(makeSurname('이'), [makeChar('나')])
    expect(result.flowsWell).toBe(true)
  })

  // Test 6 — ㅁ:ㅁ 충돌 (김+민)
  it('충돌: 김(ㅁ받침)+민(ㅁ초성) → ㅁ:ㅁ → flowsWell=false', () => {
    const result = checkNaturalness(makeSurname('김'), [makeChar('민')])
    expect(result.flowsWell).toBe(false)
  })

  // Test 7 — 2자 이름 인접 쌍만 체크: 박+이+나
  // 박(ㄱ받침)+이(ㅇ초성) → 'ㄱ:ㅇ' NOT in AWKWARD_PAIRS
  // 이(받침 없음)+나 → 충돌 없음
  it('2자 이름: 박+이+나 → flowsWell=true (ㄱ:ㅇ은 목록에 없음)', () => {
    const result = checkNaturalness(makeSurname('박'), [makeChar('이'), makeChar('나')])
    expect(result.flowsWell).toBe(true)
    expect(result.noRepeat).toBe(true)
    expect(result.isNatural).toBe(true)
  })

  // Test 8 — ㅇ:ㄴ 충돌 (강+나)
  it('충돌: 강(ㅇ받침)+나(ㄴ초성) → ㅇ:ㄴ → flowsWell=false', () => {
    const result = checkNaturalness(makeSurname('강'), [makeChar('나')])
    expect(result.flowsWell).toBe(false)
  })

  // Test 9 — 성과 이름 글자가 겹치는 경우
  it('반복 음절: 김+민+김 → noRepeat=false (성과 이름 글자 겹침)', () => {
    const result = checkNaturalness(makeSurname('김'), [makeChar('민'), makeChar('김')])
    expect(result.noRepeat).toBe(false)
  })

  // Test 10 — ㄱ:ㄴ 충돌 (학+나)
  it('충돌: 학(ㄱ받침)+나(ㄴ초성) → ㄱ:ㄴ → flowsWell=false', () => {
    const result = checkNaturalness(makeSurname('학'), [makeChar('나')])
    expect(result.flowsWell).toBe(false)
  })

  // Test 11 — isNatural은 noRepeat && flowsWell
  it('isNatural: noRepeat=true && flowsWell=false → isNatural=false', () => {
    // 김+민: 중복 없음, 충돌(ㅁ:ㅁ) 있음
    const result = checkNaturalness(makeSurname('김'), [makeChar('민'), makeChar('준')])
    expect(result.noRepeat).toBe(true)
    expect(result.flowsWell).toBe(false)
    expect(result.isNatural).toBe(false)
  })
})
