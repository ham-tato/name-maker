// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { computeSaju } from '../../src/lib/saju'

describe('computeSaju', () => {
  it('Test 1 — 2000-01-01: 己卯년, 丙子월, 庚辰일, 시주 null', () => {
    const result = computeSaju('2000-01-01', null)

    // 연주: 己卯 (입춘 전이므로 1999년 사주 → 己=index5, 卯=index3)
    expect(result.year.gan).toBe('己')
    expect(result.year.ji).toBe('卯')

    // 월주: 丙子 (소한 Jan 6 전이므로 사주월=11(子); 己년 base=丙(2); ganIdx=(2+10)%10=2=丙; jiIdx=(11+1)%12=0=子)
    expect(result.month.gan).toBe('丙')
    expect(result.month.ji).toBe('子')

    // 일주: 庚辰 (기준일)
    expect(result.day.gan).toBe('庚')
    expect(result.day.ji).toBe('辰')

    // 시주: null
    expect(result.hour).toBeNull()
  })

  it('Test 2 — 2000-03-15: 庚辰년, 己卯월, 甲午일', () => {
    const result = computeSaju('2000-03-15', null)

    // 연주: 庚辰 (입춘 후 2000년 → 庚=index6, 辰=index4)
    expect(result.year.gan).toBe('庚')
    expect(result.year.ji).toBe('辰')

    // 월주: 己卯 (경칩 Mar 6 후 사주월=2; 庚년 base=戊(4); ganIdx=(4+1)%10=5=己; jiIdx=(2+1)%12=3=卯)
    expect(result.month.gan).toBe('己')
    expect(result.month.ji).toBe('卯')

    // 일주: daysDiff=74; index=(16+74)%60=30; gan=30%10=0=甲; ji=30%12=6=午 → 甲午
    expect(result.day.gan).toBe('甲')
    expect(result.day.ji).toBe('午')

    // 시주: null
    expect(result.hour).toBeNull()
  })

  it('Test 3 — 1984-02-10: 甲子년 (입춘 후)', () => {
    const result = computeSaju('1984-02-10', null)

    // 연주: 甲子 (입춘 Feb 4 후 1984년 → 甲=index0, 子=index0)
    expect(result.year.gan).toBe('甲')
    expect(result.year.ji).toBe('子')
  })

  it('Test 4 — 2000-03-15, birthHour=10: 시주 己巳', () => {
    const result = computeSaju('2000-03-15', 10)

    // 시지: hour=10 → Math.floor((10+1)/2)=5 → 巳(index5)
    // 일간: 甲(0) → 子시 base=甲(0); hourGanIdx=(0+5)%10=5=己
    expect(result.hour).not.toBeNull()
    expect(result.hour!.gan).toBe('己')
    expect(result.hour!.ji).toBe('巳')
  })

  it('Test 5 — birthHour=23: 시지는 子(0)', () => {
    const result = computeSaju('2000-03-15', 23)

    // hour=23 → hourJiIdx=0 → 子(index0)
    expect(result.hour).not.toBeNull()
    expect(result.hour!.ji).toBe('子')
  })

  it('입춘 경계 — 2000-02-03 (입춘 전): 연주 己卯', () => {
    const result = computeSaju('2000-02-03', null)

    // 입춘 Feb 4 전이므로 1999년 사주 → 己=5, 卯=3
    expect(result.year.gan).toBe('己')
    expect(result.year.ji).toBe('卯')
  })

  it('입춘 당일 — 2000-02-04 (입춘): 연주 庚辰', () => {
    const result = computeSaju('2000-02-04', null)

    // 입춘 Feb 4 → 2000년 사주 → 庚=6, 辰=4
    expect(result.year.gan).toBe('庚')
    expect(result.year.ji).toBe('辰')
  })
})
