import type { Cheongan, Jiji, Pillar, Saju } from './types'

// 천간 배열 (index 0~9)
const CHEONGAN: Cheongan[] = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']

// 지지 배열 (index 0~11)
const JIJI: Jiji[] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

/**
 * 월(1-12)과 일(day)로 사주월(1~12)을 반환한다.
 * 사주월 1 = 寅(index 2) ~ 12 = 丑(index 1)
 */
function getSajuMonth(month: number, day: number): number {
  if (month === 1) {
    return day < 6 ? 11 : 12
  } else if (month === 2) {
    return day < 4 ? 12 : 1
  } else if (month === 3) {
    return day < 6 ? 1 : 2
  } else if (month === 4) {
    return day < 5 ? 2 : 3
  } else if (month === 5) {
    return day < 6 ? 3 : 4
  } else if (month === 6) {
    return day < 6 ? 4 : 5
  } else if (month === 7) {
    return day < 7 ? 5 : 6
  } else if (month === 8) {
    return day < 8 ? 6 : 7
  } else if (month === 9) {
    return day < 8 ? 7 : 8
  } else if (month === 10) {
    return day < 8 ? 8 : 9
  } else if (month === 11) {
    return day < 7 ? 9 : 10
  } else {
    // month === 12
    return day < 7 ? 10 : 11
  }
}

/**
 * 연주(Year Pillar) 계산
 * 입춘(立春) = 매년 2월 4일 기준
 * effectiveYear: 입춘 기준 사주 연도
 */
function computeYearPillar(effectiveYear: number): Pillar {
  const ganIdx = ((effectiveYear - 4) % 10 + 10) % 10
  const jiIdx = ((effectiveYear - 4) % 12 + 12) % 12
  return { gan: CHEONGAN[ganIdx], ji: JIJI[jiIdx] }
}

/**
 * 월주(Month Pillar) 계산 — 五虎遁年法
 * yearGanIdx: 연간의 천간 index
 * sajuMonth: 사주월(1~12)
 */
function computeMonthPillar(yearGanIdx: number, sajuMonth: number): Pillar {
  // 연간에 따른 월1(寅월) 천간 기준
  const bases: Record<number, number> = {
    0: 2, // 甲 → 丙
    5: 2, // 己 → 丙
    1: 4, // 乙 → 戊
    6: 4, // 庚 → 戊
    2: 6, // 丙 → 庚
    7: 6, // 辛 → 庚
    3: 8, // 丁 → 壬
    8: 8, // 壬 → 壬
    4: 0, // 戊 → 甲
    9: 0, // 癸 → 甲
  }
  const base = bases[yearGanIdx]
  const monthGanIdx = (base + (sajuMonth - 1)) % 10
  const monthJiIdx = (sajuMonth + 1) % 12
  return { gan: CHEONGAN[monthGanIdx], ji: JIJI[monthJiIdx] }
}

/**
 * 일주(Day Pillar) 계산
 * 기준: 2000-01-01 = 庚辰日 = 60갑자 index 16
 */
function computeDayPillar(birthdate: string): Pillar {
  const ref = new Date('2000-01-01T00:00:00Z')
  const target = new Date(birthdate + 'T00:00:00Z')
  const daysDiff = Math.round((target.getTime() - ref.getTime()) / 86400000)
  const index60 = ((16 + daysDiff) % 60 + 60) % 60
  const ganIdx = index60 % 10
  const jiIdx = index60 % 12
  return { gan: CHEONGAN[ganIdx], ji: JIJI[jiIdx] }
}

/**
 * 시주(Hour Pillar) 계산 — 五鼠遁日法
 * dayGanIdx: 일간의 천간 index
 * birthHour: 0~23
 */
function computeHourPillar(dayGanIdx: number, birthHour: number): Pillar {
  // 시지 계산: 23시는 子(0), 나머지는 Math.floor((hour+1)/2)
  const hourJiIdx = birthHour === 23 ? 0 : Math.floor((birthHour + 1) / 2)

  // 일간에 따른 子시 천간 기준 (五鼠遁日法)
  const bases: Record<number, number> = {
    0: 0, // 甲 → 甲
    5: 0, // 己 → 甲
    1: 2, // 乙 → 丙
    6: 2, // 庚 → 丙
    2: 4, // 丙 → 戊
    7: 4, // 辛 → 戊
    3: 6, // 丁 → 庚
    8: 6, // 壬 → 庚
    4: 8, // 戊 → 壬
    9: 8, // 癸 → 壬
  }
  const base = bases[dayGanIdx]
  const hourGanIdx = (base + hourJiIdx) % 10
  return { gan: CHEONGAN[hourGanIdx], ji: JIJI[hourJiIdx] }
}

/**
 * 사주팔자 계산 메인 함수
 * @param birthdate - 생년월일 (YYYY-MM-DD 형식)
 * @param birthHour - 태어난 시각 (0~23), 모르면 null
 * @returns Saju (사주팔자)
 */
export function computeSaju(birthdate: string, birthHour: number | null): Saju {
  const [yearStr, monthStr, dayStr] = birthdate.split('-')
  const calYear = parseInt(yearStr, 10)
  const calMonth = parseInt(monthStr, 10)
  const calDay = parseInt(dayStr, 10)

  // 입춘(Feb 4) 기준 사주 연도 결정
  const isBeforeIpchun =
    calMonth < 2 || (calMonth === 2 && calDay < 4)
  const effectiveYear = isBeforeIpchun ? calYear - 1 : calYear

  // 연주 계산
  const yearPillar = computeYearPillar(effectiveYear)
  const yearGanIdx = CHEONGAN.indexOf(yearPillar.gan)

  // 사주월 결정 (입춘 전 Jan은 이전 연도이므로 실제 calendar month/day 사용)
  const sajuMonth = getSajuMonth(calMonth, calDay)

  // 월주 계산 (연간 index 사용)
  const monthPillar = computeMonthPillar(yearGanIdx, sajuMonth)

  // 일주 계산
  const dayPillar = computeDayPillar(birthdate)
  const dayGanIdx = CHEONGAN.indexOf(dayPillar.gan)

  // 시주 계산
  const hourPillar =
    birthHour !== null ? computeHourPillar(dayGanIdx, birthHour) : null

  return {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
  }
}
