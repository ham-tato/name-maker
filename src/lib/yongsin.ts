import type { Ohaeng, Cheongan, Jiji, Saju } from './types'

// 천간 → 오행
const GAN_OHAENG: Record<Cheongan, Ohaeng> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
}

// 지지 → 오행
const JI_OHAENG: Record<Jiji, Ohaeng> = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木',
  '辰': '土', '巳': '火', '午': '火', '未': '土',
  '申': '金', '酉': '金', '戌': '土', '亥': '水',
}

// 오행 상생: A → A가 생하는 오행
// 木생火, 火생土, 土생金, 金생水, 水생木
const SAENGSAENG: Record<Ohaeng, Ohaeng> = {
  '木': '火', '火': '土', '土': '金', '金': '水', '水': '木',
}

// 오행 상극: A → A가 극하는 오행
// 木극土, 火극金, 土극水, 金극木, 水극火
const GEUK: Record<Ohaeng, Ohaeng> = {
  '木': '土', '火': '金', '土': '水', '金': '木', '水': '火',
}

// A를 생해주는 오행 (인성 관계)
// 水생木, 木생火, 火생土, 土생金, 金생水
const SAENGME: Record<Ohaeng, Ohaeng> = {
  '木': '水', '火': '木', '土': '火', '金': '土', '水': '金',
}

// A를 극하는 오행 (관살 관계)
// 金극木, 水극火, 木극土, 火극金, 土극水
const GEUKME: Record<Ohaeng, Ohaeng> = {
  '木': '金', '火': '水', '土': '木', '金': '火', '水': '土',
}

/**
 * 사주팔자에서 용신(用神) 오행 2개를 추출한다.
 */
export function extractYongsin(saju: Saju): Ohaeng[] {
  const dayOhaeng = GAN_OHAENG[saju.day.gan]

  // 일간 오행을 생해주는 오행 (印星)
  const inseong = SAENGME[dayOhaeng]
  // 일간 오행을 극하는 오행 (官殺)
  const gwansal = GEUKME[dayOhaeng]
  // 일간이 생해주는 오행 (食傷)
  const siksang = SAENGSAENG[dayOhaeng]
  // 일간이 극하는 오행 (財星)
  const jaeseong = GEUK[dayOhaeng]

  // 점수 계산 함수: 글자 하나의 오행이 일간에 미치는 점수
  function score(o: Ohaeng): number {
    if (o === dayOhaeng) return 2      // 比劫: +2
    if (o === inseong) return 1        // 印星: +1
    if (o === gwansal) return -2       // 官殺: -2
    if (o === siksang) return -1       // 食傷: -1
    if (o === jaeseong) return -1      // 財星: -1
    return 0
  }

  // 7글자 수집 (일간 제외): 년간, 년지, 월간, 월지, 일지, 시간, 시지
  // 월지는 2배 가중치
  let total = 0

  total += score(GAN_OHAENG[saju.year.gan])     // 년간
  total += score(JI_OHAENG[saju.year.ji])       // 년지
  total += score(GAN_OHAENG[saju.month.gan])    // 월간
  // 월지: 2배 가중치
  total += score(JI_OHAENG[saju.month.ji]) * 2  // 월지
  total += score(JI_OHAENG[saju.day.ji])        // 일지

  if (saju.hour !== null) {
    total += score(GAN_OHAENG[saju.hour.gan])   // 시간
    total += score(JI_OHAENG[saju.hour.ji])     // 시지
  }

  // 신강(total > 0) vs 신약(total <= 0)
  if (total > 0) {
    // 신강: 설기·억제할 오행이 용신
    // 식상(일간이 생하는 오행), 관살(일간을 극하는 오행)
    return [siksang, gwansal]
  } else {
    // 신약: 일간을 강하게 해줄 오행이 용신
    // 인성(생해주는 오행), 비겁(같은 오행)
    return [inseong, dayOhaeng]
  }
}
