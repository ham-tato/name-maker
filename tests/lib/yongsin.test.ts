// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { extractYongsin } from '@/lib/yongsin'
import type { Saju } from '@/lib/types'

describe('extractYongsin', () => {
  it('Test 1 — 신약한 木일간: 용신은 水, 木', () => {
    const saju: Saju = {
      year: { gan: '庚', ji: '申' },  // 庚=金, 申=金
      month: { gan: '庚', ji: '申' }, // 庚=金, 申=金 (월지 가중치 2배)
      day: { gan: '甲', ji: '申' },   // 甲=木 일간, 申=金
      hour: { gan: '庚', ji: '子' },  // 庚=金, 子=水
    }
    const result = extractYongsin(saju)
    expect(result).toContain('水')
    expect(result).toContain('木')
    expect(result).toHaveLength(2)
  })

  it('Test 2 — 신강한 火일간: 용신은 土, 水', () => {
    const saju: Saju = {
      year: { gan: '丙', ji: '午' },  // 丙=火, 午=火
      month: { gan: '丁', ji: '午' }, // 丁=火, 午=火 (월지 가중치 2배)
      day: { gan: '丙', ji: '寅' },   // 丙=火 일간, 寅=木
      hour: { gan: '甲', ji: '午' },  // 甲=木, 午=火
    }
    const result = extractYongsin(saju)
    expect(result).toContain('土')
    expect(result).toContain('水')
    expect(result).toHaveLength(2)
  })

  it('Test 3 — hour가 null인 경우: 크래시 없이 2개 반환', () => {
    const saju: Saju = {
      year: { gan: '壬', ji: '子' },
      month: { gan: '壬', ji: '子' },
      day: { gan: '甲', ji: '子' },
      hour: null,
    }
    const result = extractYongsin(saju)
    expect(result).toHaveLength(2)
  })
})
