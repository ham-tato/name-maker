import type { Ohaeng, Cheongan, Jiji } from './types'

export const OHAENG_HEX: Record<Ohaeng, string> = {
  '木': '#4CAF50',
  '火': '#F44336',
  '土': '#FF9800',
  '金': '#9E9E9E',
  '水': '#2196F3',
}

export const GAN_OHAENG: Record<Cheongan, Ohaeng> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
}

export const JI_OHAENG: Record<Jiji, Ohaeng> = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木',
  '辰': '土', '巳': '火', '午': '火', '未': '土',
  '申': '金', '酉': '金', '戌': '土', '亥': '水',
}
