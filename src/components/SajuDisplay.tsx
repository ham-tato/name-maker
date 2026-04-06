import type { Saju, Ohaeng, Cheongan, Jiji } from '../lib/types'

interface SajuDisplayProps {
  saju: Saju
  yongsin: Ohaeng[]
}

const OHAENG_COLOR: Record<Ohaeng, string> = {
  '木': 'text-wood',
  '火': 'text-fire',
  '土': 'text-earth',
  '金': 'text-metal',
  '水': 'text-water',
}

const OHAENG_HEX: Record<Ohaeng, string> = {
  '木': '#4CAF50',
  '火': '#F44336',
  '土': '#FF9800',
  '金': '#9E9E9E',
  '水': '#2196F3',
}

const GAN_OHAENG: Record<Cheongan, Ohaeng> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
}

const JI_OHAENG: Record<Jiji, Ohaeng> = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木',
  '辰': '土', '巳': '火', '午': '火', '未': '土',
  '申': '金', '酉': '金', '戌': '土', '亥': '水',
}

const PILLAR_LABELS = ['년주', '월주', '일주', '시주']

export default function SajuDisplay({ saju, yongsin }: SajuDisplayProps) {
  const pillars = [saju.year, saju.month, saju.day, saju.hour]

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      {/* 사주팔자 섹션 */}
      <p className="text-sm font-semibold text-gray-500 mb-3">사주팔자</p>
      <div className="grid grid-cols-4 gap-2 text-center">
        {pillars.map((pillar, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className="text-xs text-gray-400">{PILLAR_LABELS[i]}</span>
            {pillar ? (
              <>
                <span className={`font-serif text-xl ${OHAENG_COLOR[GAN_OHAENG[pillar.gan]]}`}>
                  {pillar.gan}
                </span>
                <span className={`font-serif text-lg ${OHAENG_COLOR[JI_OHAENG[pillar.ji]]}`}>
                  {pillar.ji}
                </span>
              </>
            ) : (
              <span className="font-serif text-lg text-gray-300">모름</span>
            )}
          </div>
        ))}
      </div>

      {/* 용신 섹션 */}
      {yongsin.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-semibold text-gray-500 mb-2">용신 오행</p>
          <div className="flex flex-wrap gap-2">
            {yongsin.map((o) => (
              <span
                key={o}
                className="font-serif text-base rounded px-2 py-1"
                style={{
                  backgroundColor: OHAENG_HEX[o] + '33',
                  color: OHAENG_HEX[o],
                }}
              >
                {o}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
