import suri81Data from '../data/suri81.json'
import type { SelectedSurname, HanjaEntry, SuriResult, Suri81Entry } from './types'

// suri81Data의 타입을 명시적으로 선언
const suri81 = suri81Data as Record<string, { name: string; luck: string; desc: string }>

/**
 * 81수리 정규화 함수
 * 81 초과 시 81로 나눈 나머지로 치환 (나머지가 0이면 81)
 */
function normalizeSuri(num: number): number {
  if (num <= 81) return num
  const remainder = num % 81
  return remainder === 0 ? 81 : remainder
}

/**
 * 81수리 조회 함수
 * 주어진 수를 string key로 suri81.json에서 조회 (81 초과 시 자동 정규화)
 */
function lookupSuri81(num: number): Suri81Entry {
  const normalized = normalizeSuri(num)
  const entry = suri81[String(normalized)]
  if (!entry) {
    throw new Error(`suri81.json에 ${normalized}번 항목이 없습니다.`)
  }
  return entry as Suri81Entry
}

/**
 * 길흉 판정 함수
 * luck 값이 '대길' | '길' | '반길' 이면 길(吉)로 판단
 */
function isGil(entry: Suri81Entry): boolean {
  return entry.luck === '대길' || entry.luck === '길' || entry.luck === '반길'
}

/**
 * 수리성명학 4格 계산 함수
 *
 * @param surname - 선택된 성씨 (획수 포함)
 * @param chars - 이름 한자 배열 (1자 또는 2자)
 * @returns SuriResult - 원격, 형격, 이격, 정격 및 81수리 길흉 판정 결과
 */
export function computeSuri(
  surname: SelectedSurname,
  chars: HanjaEntry[]
): SuriResult {
  const surnameStroke = surname.stroke

  // 이름 첫 번째 글자 획수
  const firstCharStroke = chars[0].stroke

  // 이름 전체 획수 합
  const totalNameStroke = chars.reduce((sum, c) => sum + c.stroke, 0)

  // 원격(元格): 이름 첫 번째 글자 획수
  const won = firstCharStroke

  // 형격(亨格): 성 획수 + 이름 첫 번째 글자 획수
  const hyeong = surnameStroke + firstCharStroke

  // 이격(利格): 이름 전체 획수 합
  const i = totalNameStroke

  // 정격(貞格): 성 획수 + 이름 전체 획수 합 (81 초과 시 81로 나눈 나머지, 나머지가 0이면 81)
  const rawJeong = surnameStroke + totalNameStroke
  const jeong = normalizeSuri(rawJeong)

  // 81수리 조회
  const wonLuck = lookupSuri81(won)
  const hyeongLuck = lookupSuri81(hyeong)
  const iLuck = lookupSuri81(i)
  const jeongLuck = lookupSuri81(jeong)

  // 4格 모두 길격인지 판정
  const isAllGil = isGil(wonLuck) && isGil(hyeongLuck) && isGil(iLuck) && isGil(jeongLuck)

  return {
    won,
    hyeong,
    i,
    jeong,
    wonLuck,
    hyeongLuck,
    iLuck,
    jeongLuck,
    isAllGil,
  }
}
