import type { Saju, Ohaeng, Cheongan, Jiji } from '../lib/types'
import { OHAENG_HEX, GAN_OHAENG, JI_OHAENG } from '../lib/constants'

interface SajuDisplayProps {
  saju: Saju
  yongsin: Ohaeng[]
}

const GAN_READING: Record<Cheongan, string> = {
  '甲': '갑', '乙': '을', '丙': '병', '丁': '정',
  '戊': '무', '己': '기', '庚': '경', '辛': '신',
  '壬': '임', '癸': '계',
}

const JI_READING: Record<Jiji, string> = {
  '子': '자', '丑': '축', '寅': '인', '卯': '묘',
  '辰': '진', '巳': '사', '午': '오', '未': '미',
  '申': '신', '酉': '유', '戌': '술', '亥': '해',
}

const PILLAR_LABELS = ['년주', '월주', '일주', '시주']

function CharBlock({ char, ohaeng }: { char: string; reading: string; ohaeng: Ohaeng }) {
  const hex = OHAENG_HEX[ohaeng]
  return (
    <div
      className="flex items-center gap-1 px-2 py-1.5 rounded-lg"
      style={{ backgroundColor: hex + '20', border: `1px solid ${hex}55` }}
    >
      <span className="font-serif text-xl leading-none" style={{ color: hex }}>
        {char}
      </span>
    </div>
  )
}

export default function SajuDisplay({ saju, yongsin }: SajuDisplayProps) {
  const pillars = [saju.year, saju.month, saju.day, saju.hour]

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <p className="text-sm font-semibold text-gray-500 mb-3">사주팔자</p>
      <div className="grid grid-cols-4 gap-2 text-center">
        {pillars.map((pillar, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <span className="text-xs text-gray-400">{PILLAR_LABELS[i]}</span>
            {pillar ? (
              <>
                {/* 천간 블록 */}
                <div className="flex flex-col items-center gap-0.5">
                  <CharBlock
                    char={pillar.gan}
                    reading={GAN_READING[pillar.gan]}
                    ohaeng={GAN_OHAENG[pillar.gan]}
                  />
                  <span className="text-[11px] text-gray-400">{GAN_READING[pillar.gan]}</span>
                </div>
                {/* 지지 블록 */}
                <div className="flex flex-col items-center gap-0.5">
                  <CharBlock
                    char={pillar.ji}
                    reading={JI_READING[pillar.ji]}
                    ohaeng={JI_OHAENG[pillar.ji]}
                  />
                  <span className="text-[11px] text-gray-400">{JI_READING[pillar.ji]}</span>
                </div>
              </>
            ) : (
              <span className="text-sm text-gray-300 mt-2">모름</span>
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
