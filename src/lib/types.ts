// 오행
export type Ohaeng = '木' | '火' | '土' | '金' | '水'

// 천간
export type Cheongan = '甲' | '乙' | '丙' | '丁' | '戊' | '己' | '庚' | '辛' | '壬' | '癸'

// 지지
export type Jiji = '子' | '丑' | '寅' | '卯' | '辰' | '巳' | '午' | '未' | '申' | '酉' | '戌' | '亥'

// 기둥 (천간 + 지지)
export interface Pillar {
  gan: Cheongan
  ji: Jiji
}

// 사주팔자
export interface Saju {
  year: Pillar
  month: Pillar
  day: Pillar
  hour: Pillar | null  // 시간 모를 때 null
}

// 한자 데이터 (hanja.json 스키마)
export interface HanjaEntry {
  char: string
  stroke: number
  ohaeng: Ohaeng
  reading: string       // 한글 독음 (예: "지")
  meaning: string       // 뜻 (예: "지혜롭다")
  gender: 'male' | 'female' | 'neutral'
  positive: boolean     // 뜻이 긍정적이면 true (부정·중립이면 false)
}

// 성씨 데이터 (surnames.json 스키마)
export interface SurnameEntry {
  reading: string       // 한글 발음 (예: "김")
  hanja: {
    char: string
    stroke: number
    ohaeng: Ohaeng
    meaning: string
  }[]
}

// 81수리 항목 (suri81.json 스키마)
export interface Suri81Entry {
  name: string          // 수리 이름 (예: "태극수")
  luck: '대길' | '길' | '반길' | '흉' | '대흉'
  desc: string
}

// 성씨 선택 결과
export interface SelectedSurname {
  reading: string
  char: string
  stroke: number
  ohaeng: Ohaeng
}

// 수리 4격 결과
export interface SuriResult {
  won: number           // 원격
  hyeong: number        // 형격
  i: number             // 이격
  jeong: number         // 정격
  wonLuck: Suri81Entry
  hyeongLuck: Suri81Entry
  iLuck: Suri81Entry
  jeongLuck: Suri81Entry
  isAllGil: boolean
}

// 오행 판정 결과
export interface OhaengResult {
  jawi: Ohaeng[]        // 자원오행 배열 (성+이름)
  jawiSangsaeng: boolean
  balpum: Ohaeng[]      // 발음오행 배열
  balpumSangsaeng: boolean
}

// 음양 판정 결과
export interface EumyangResult {
  pattern: ('양' | '음')[]
  isBalanced: boolean
}

// 자연스러움 판정 결과
export interface NaturalnessResult {
  noRepeat: boolean       // 반복 음절 없음
  flowsWell: boolean      // 전체 발음이 자연스러움 (받침+초성 충돌 없음)
  isNatural: boolean      // noRepeat && flowsWell
}

// 이름 후보 하나
export interface NameCandidate {
  surname: SelectedSurname
  chars: HanjaEntry[]               // 이름 글자 (1~2자)
  fullReading: string               // 전체 한글 독음 (예: "김지우")
  fullHanja: string                 // 전체 한자 (예: "金智宇")
  meaning: string                   // 이름 뜻 합산
  suri: SuriResult
  ohaeng: OhaengResult
  eumyang: EumyangResult
  naturalness: NaturalnessResult
  yongsinIncluded: boolean          // 용신 오행 포함 여부
  score: number                     // 폴백용 점수 (0~6)
  relaxed: boolean                  // 조건 완화 여부
}

// 도시 항목
export interface CityEntry {
  name: string
  longitude: number
  major: boolean
}

// 입력 폼 상태
export interface InputState {
  birthdate: string                 // YYYY-MM-DD
  birthHour: number | null          // 0~23, null=모름
  birthCityName: string             // 출생지 도시 이름 (표시용)
  birthLongitude: number | null     // 출생지 경도 (시간보정용)
  gender: 'male' | 'female' | 'neutral'
  surnameReading: string
  selectedSurname: SelectedSurname | null
  nameLength: 1 | 2
}

// 결과 상태
export interface ResultState {
  saju: Saju | null
  yongsin: Ohaeng[]
  candidates: NameCandidate[]
  isLoading: boolean
  error: string | null
}
