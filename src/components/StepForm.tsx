import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNameStore } from '../stores/nameStore'
import type { SurnameEntry, CityEntry } from '../lib/types'
import citiesData from '../data/cities.json'

const ALL_CITIES: CityEntry[] = citiesData as CityEntry[]
const MAJOR_CITIES = ALL_CITIES.filter(c => c.major)

const SIJIN_OPTIONS: { value: number | null; label: string; sub: string }[] = [
  { value: null,  label: '모름',    sub: '' },
  { value: 0,     label: '자시(子)', sub: '23:30 ~ 01:30' },
  { value: 2,     label: '축시(丑)', sub: '01:30 ~ 03:30' },
  { value: 4,     label: '인시(寅)', sub: '03:30 ~ 05:30' },
  { value: 6,     label: '묘시(卯)', sub: '05:30 ~ 07:30' },
  { value: 8,     label: '진시(辰)', sub: '07:30 ~ 09:30' },
  { value: 10,    label: '사시(巳)', sub: '09:30 ~ 11:30' },
  { value: 12,    label: '오시(午)', sub: '11:30 ~ 13:30' },
  { value: 14,    label: '미시(未)', sub: '13:30 ~ 15:30' },
  { value: 16,    label: '신시(申)', sub: '15:30 ~ 17:30' },
  { value: 18,    label: '유시(酉)', sub: '17:30 ~ 19:30' },
  { value: 20,    label: '술시(戌)', sub: '19:30 ~ 21:30' },
  { value: 22,    label: '해시(亥)', sub: '21:30 ~ 23:30' },
]

function toModifierForm(meaning: string): string {
  const first = meaning.split(',')[0].trim()
  if (first.endsWith('하다')) return first.slice(0, -2) + '할'
  if (!first.endsWith('다')) return first
  const stem = first.slice(0, -1)
  const last = stem[stem.length - 1]
  const code = last.charCodeAt(0)
  if (code < 0xAC00 || code > 0xD7A3) return stem
  const jongseong = (code - 0xAC00) % 28
  return jongseong === 0
    ? stem.slice(0, -1) + String.fromCharCode(code + 8)
    : stem + '을'
}

const TOTAL_STEPS = 6

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 320, damping: 32 },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? '-40%' : '40%',
    opacity: 0,
    transition: { duration: 0.18, ease: 'easeIn' as const },
  }),
}

// ─── Step 1: 생년월일 ────────────────────────────────────────────────
function BirthdateStep({ onNext }: { onNext: () => void }) {
  const { input, setInput } = useNameStore()
  const [year, setYear] = useState('')
  const [month, setMonth] = useState('')
  const [day, setDay] = useState('')
  const monthRef = useRef<HTMLInputElement>(null)
  const dayRef = useRef<HTMLInputElement>(null)

  // sync from store if already set
  useEffect(() => {
    if (input.birthdate) {
      const [y, m, d] = input.birthdate.split('-')
      setYear(y); setMonth(String(Number(m))); setDay(String(Number(d)))
    }
  }, [])

  function commit(y: string, m: string, d: string) {
    if (y.length === 4 && m && d) {
      setInput({ birthdate: `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}` })
    } else {
      setInput({ birthdate: '' })
    }
  }

  const isValid = year.length === 4 && !!month && !!day

  const preview = year || month || day
    ? `${year || '____'}년 ${month || '__'}월 ${day || '__'}일`
    : null

  return (
    <div className="flex flex-col h-full">
      <p className="text-white/50 text-sm mb-3">생년월일</p>
      <h2 className="text-2xl font-bold text-white mb-8 leading-snug">
        아이가 태어난 날이<br />언제인가요?
      </h2>

      {/* 미리보기 */}
      <div className="mb-8 text-3xl font-bold text-white/20 tracking-wide">
        {preview || '____년 __월 __일'}
      </div>

      {/* 입력 */}
      <div className="flex gap-3 mb-10">
        <div className="flex flex-col items-center gap-1">
          <input
            type="number"
            inputMode="numeric"
            placeholder="연도"
            value={year}
            min={1900} max={2100}
            onChange={e => {
              setYear(e.target.value)
              commit(e.target.value, month, day)
              if (e.target.value.length === 4) monthRef.current?.focus()
            }}
            className="w-24 bg-transparent border-b-2 border-white/30 focus:border-gold text-white text-center text-lg py-2 outline-none transition-colors"
          />
          <span className="text-white/40 text-xs">년</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <input
            ref={monthRef}
            type="number"
            inputMode="numeric"
            placeholder="월"
            value={month}
            min={1} max={12}
            onChange={e => {
              setMonth(e.target.value)
              commit(year, e.target.value, day)
              if (e.target.value.length >= 2) dayRef.current?.focus()
            }}
            className="w-16 bg-transparent border-b-2 border-white/30 focus:border-gold text-white text-center text-lg py-2 outline-none transition-colors"
          />
          <span className="text-white/40 text-xs">월</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <input
            ref={dayRef}
            type="number"
            inputMode="numeric"
            placeholder="일"
            value={day}
            min={1} max={31}
            onChange={e => {
              setDay(e.target.value)
              commit(year, month, e.target.value)
            }}
            className="w-16 bg-transparent border-b-2 border-white/30 focus:border-gold text-white text-center text-lg py-2 outline-none transition-colors"
          />
          <span className="text-white/40 text-xs">일</span>
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!isValid}
        className="w-full py-4 rounded-2xl bg-gold text-white font-semibold text-base disabled:opacity-30 disabled:cursor-not-allowed transition-opacity mt-auto"
      >
        다음
      </button>
    </div>
  )
}

// ─── Step 2: 시진 ────────────────────────────────────────────────────
function SijinStep({ onNext }: { onNext: () => void }) {
  const { input, setInput } = useNameStore()
  const selected = input.birthHour

  function select(val: number | null) {
    setInput({ birthHour: val })
  }

  return (
    <div className="flex flex-col h-full">
      <p className="text-white/50 text-sm mb-3">태어난 시간</p>
      <h2 className="text-2xl font-bold text-white mb-2 leading-snug">
        태어난 시간대를<br />알고 있나요?
      </h2>
      <p className="text-white/40 text-sm mb-8">사주 계산에 사용됩니다. 모르면 건너뛰어도 됩니다.</p>

      <div className="grid grid-cols-3 gap-2 mb-8 overflow-y-auto flex-1">
        {SIJIN_OPTIONS.map(opt => {
          const isSelected = selected === opt.value
          return (
            <button
              key={opt.value === null ? 'null' : opt.value}
              onClick={() => select(opt.value)}
              className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border text-center transition-all ${
                isSelected
                  ? 'border-gold bg-gold/10 text-gold'
                  : 'border-white/10 text-white/60 hover:border-white/30'
              }`}
            >
              <span className="text-sm font-medium">{opt.label}</span>
              {opt.sub && <span className="text-[10px] opacity-60 mt-0.5">{opt.sub}</span>}
            </button>
          )
        })}
      </div>

      <button
        onClick={onNext}
        className="w-full py-4 rounded-2xl bg-gold text-white font-semibold text-base transition-opacity mt-auto"
      >
        다음
      </button>
    </div>
  )
}

// ─── Step 3: 성별 ────────────────────────────────────────────────────
function GenderStep({ onNext }: { onNext: () => void }) {
  const { input, setInput } = useNameStore()

  function select(val: 'male' | 'female' | 'neutral') {
    setInput({ gender: val })
    setTimeout(onNext, 150)
  }

  const opts = [
    { value: 'male' as const, emoji: '👦', label: '남아' },
    { value: 'female' as const, emoji: '👧', label: '여아' },
    { value: 'neutral' as const, emoji: '✨', label: '성별 무관' },
  ]

  return (
    <div className="flex flex-col h-full">
      <p className="text-white/50 text-sm mb-3">성별</p>
      <h2 className="text-2xl font-bold text-white mb-10 leading-snug">
        아이의 성별이<br />무엇인가요?
      </h2>

      <div className="flex flex-col gap-3 flex-1">
        {opts.map(opt => (
          <button
            key={opt.value}
            onClick={() => select(opt.value)}
            className={`flex items-center gap-4 px-6 py-5 rounded-2xl border text-left transition-all ${
              input.gender === opt.value
                ? 'border-gold bg-gold/10'
                : 'border-white/10 hover:border-white/30'
            }`}
          >
            <span className="text-2xl">{opt.emoji}</span>
            <span className="text-white text-lg font-medium">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Step 4: 성씨 ────────────────────────────────────────────────────
function SurnameStep({ onNext }: { onNext: () => void }) {
  const { input, setInput, surnameMatches, searchSurname, selectSurname } = useNameStore()
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) setShowDropdown(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setInput({ surnameReading: val, selectedSurname: null })
    searchSurname(val)
    setShowDropdown(val.length > 0)
  }

  function handleSelect(entry: SurnameEntry, hanjaIndex: number) {
    const hanja = entry.hanja[hanjaIndex]
    selectSurname({ reading: entry.reading, char: hanja.char, stroke: hanja.stroke, ohaeng: hanja.ohaeng })
    setShowDropdown(false)
  }

  const isValid = !!input.selectedSurname

  return (
    <div className="flex flex-col h-full">
      <p className="text-white/50 text-sm mb-3">성씨</p>
      <h2 className="text-2xl font-bold text-white mb-8 leading-snug">
        아이의 성씨가<br />어떻게 되나요?
      </h2>

      <div className="relative mb-4">
        <div className="flex items-end gap-3 border-b-2 border-white/30 focus-within:border-gold pb-2 transition-colors">
          <input
            ref={inputRef}
            type="text"
            value={input.surnameReading}
            onChange={handleInput}
            onFocus={() => { if (input.surnameReading && surnameMatches.length > 0) setShowDropdown(true) }}
            placeholder="성씨를 입력하세요 (예: 김)"
            autoComplete="off"
            className="flex-1 bg-transparent text-white text-xl outline-none placeholder-white/20"
          />
          {input.selectedSurname && (
            <span className="text-gold text-2xl font-serif pb-0.5">{input.selectedSurname.char}</span>
          )}
        </div>

        {showDropdown && surnameMatches.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-20 w-full mt-2 bg-[#1e1e1e] border border-white/10 rounded-xl shadow-2xl max-h-48 overflow-y-auto"
          >
            {surnameMatches.flatMap(entry =>
              [...entry.hanja]
                .sort((a, b) => (a.meaning.includes('성씨') ? 0 : 1) - (b.meaning.includes('성씨') ? 0 : 1))
                .map(h => (
                  <button
                    key={`${entry.reading}-${h.char}`}
                    type="button"
                    onClick={() => handleSelect(entry, entry.hanja.indexOf(h))}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-white/5 flex items-center gap-3"
                  >
                    <span className="font-serif text-gold text-lg">{h.char}</span>
                    <span className="text-white/60">
                      {toModifierForm(h.meaning)} {entry.reading}
                    </span>
                  </button>
                ))
            )}
          </div>
        )}
      </div>

      <button
        onClick={onNext}
        disabled={!isValid}
        className="w-full py-4 rounded-2xl bg-gold text-white font-semibold text-base disabled:opacity-30 disabled:cursor-not-allowed transition-opacity mt-auto"
      >
        다음
      </button>
    </div>
  )
}

// ─── Step 5: 출생지 ──────────────────────────────────────────────────
function CityStep({ onNext }: { onNext: () => void }) {
  const { input, setInput } = useNameStore()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<CityEntry[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) setShowDropdown(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleQuery(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value
    setQuery(q)
    if (q.length > 0) {
      setResults(ALL_CITIES.filter(c => c.name.includes(q)))
      setShowDropdown(true)
    } else {
      setResults([])
      setShowDropdown(false)
    }
  }

  function selectCity(city: CityEntry) {
    setInput({ birthCityName: city.name, birthLongitude: city.longitude })
    setQuery('')
    setShowDropdown(false)
  }

  function clearCity() {
    setInput({ birthCityName: '', birthLongitude: null })
  }

  function offsetLabel(lng: number) {
    const min = Math.round((lng - 135) * 4)
    return min <= 0 ? `${min}분` : `+${min}분`
  }

  return (
    <div className="flex flex-col h-full">
      <p className="text-white/50 text-sm mb-3">출생지</p>
      <h2 className="text-2xl font-bold text-white mb-2 leading-snug">
        출생지가<br />어디인가요?
      </h2>
      <p className="text-white/40 text-sm mb-6">경도 기반 진태양시 보정에 사용됩니다. 선택 사항입니다.</p>

      {input.birthCityName && (
        <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-xl bg-gold/10 border border-gold/30">
          <span className="text-gold font-medium">{input.birthCityName}</span>
          <span className="text-white/40 text-xs">({offsetLabel(input.birthLongitude!)} 보정)</span>
          <button onClick={clearCity} className="ml-auto text-white/30 hover:text-white/60 text-xs">✕</button>
        </div>
      )}

      {/* 주요 도시 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {MAJOR_CITIES.map(city => (
          <button
            key={city.name}
            onClick={() => selectCity(city)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
              input.birthCityName === city.name
                ? 'border-gold bg-gold/10 text-gold'
                : 'border-white/15 text-white/50 hover:border-white/30'
            }`}
          >
            {city.name}
          </button>
        ))}
      </div>

      {/* 검색 */}
      <div className="relative mb-6">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleQuery}
          placeholder="도시명 검색 (예: 파주, Tokyo...)"
          className="w-full bg-transparent border-b border-white/20 focus:border-gold text-white py-2 outline-none placeholder-white/20 text-sm transition-colors"
        />
        {showDropdown && results.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-20 w-full mt-1 bg-[#1e1e1e] border border-white/10 rounded-xl shadow-2xl max-h-36 overflow-y-auto"
          >
            {results.map(city => (
              <button
                key={city.name}
                onClick={() => selectCity(city)}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 flex justify-between text-white/80"
              >
                <span>{city.name}</span>
                <span className="text-white/30 text-xs">{offsetLabel(city.longitude)} 보정</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 mt-auto">
        <button
          onClick={() => { clearCity(); onNext() }}
          className="flex-1 py-4 rounded-2xl border border-white/15 text-white/50 font-medium text-sm hover:border-white/30 transition-colors"
        >
          건너뛰기
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-4 rounded-2xl bg-gold text-white font-semibold text-base transition-opacity"
        >
          다음
        </button>
      </div>
    </div>
  )
}

// ─── Step 6: 이름 글자 수 ────────────────────────────────────────────
function NameLengthStep() {
  const { input, setInput, generate } = useNameStore()

  function select(val: 1 | 2) {
    setInput({ nameLength: val })
    setTimeout(generate, 100)
  }

  return (
    <div className="flex flex-col h-full">
      <p className="text-white/50 text-sm mb-3">이름 글자 수</p>
      <h2 className="text-2xl font-bold text-white mb-10 leading-snug">
        이름은 몇 글자로<br />지을까요?
      </h2>

      <div className="flex flex-col gap-4 flex-1">
        {[
          { value: 1 as const, label: '1자', example: '예: 홍민 → 민(旼)' },
          { value: 2 as const, label: '2자', example: '예: 홍지민 → 지민(智旼)' },
        ].map(opt => (
          <button
            key={opt.value}
            onClick={() => select(opt.value)}
            className={`flex flex-col items-start px-6 py-6 rounded-2xl border text-left transition-all ${
              input.nameLength === opt.value
                ? 'border-gold bg-gold/10'
                : 'border-white/10 hover:border-white/30'
            }`}
          >
            <span className="text-white text-xl font-bold mb-1">{opt.label}</span>
            <span className="text-white/40 text-sm">{opt.example}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Main StepForm ────────────────────────────────────────────────────
export function StepForm() {
  const [stepIndex, setStepIndex] = useState(0)
  const [direction, setDirection] = useState(1)

  function goNext() {
    setDirection(1)
    setStepIndex(i => i + 1)
  }

  function goBack() {
    setDirection(-1)
    setStepIndex(i => i - 1)
  }

  const steps = [
    <BirthdateStep key="birthdate" onNext={goNext} />,
    <SijinStep key="sijin" onNext={goNext} />,
    <GenderStep key="gender" onNext={goNext} />,
    <SurnameStep key="surname" onNext={goNext} />,
    <CityStep key="city" onNext={goNext} />,
    <NameLengthStep key="nameLength" />,
  ]

  const progress = (stepIndex + 1) / TOTAL_STEPS

  return (
    <div className="min-h-screen bg-[#111111] flex flex-col px-6">
      {/* 상단 프로그레스 + 뒤로가기 */}
      <div className="pt-12 pb-6">
        {/* 얇은 프로그레스 바 */}
        <div className="w-full h-0.5 bg-white/10 rounded-full mb-6">
          <motion.div
            className="h-full bg-gold rounded-full"
            animate={{ width: `${progress * 100}%` }}
            transition={{ type: 'spring', stiffness: 200, damping: 30 }}
          />
        </div>

        {/* 뒤로가기 + 스텝 표시 */}
        <div className="flex items-center justify-between">
          {stepIndex > 0 ? (
            <button
              onClick={goBack}
              className="text-white/50 hover:text-white transition-colors text-xl"
            >
              ←
            </button>
          ) : (
            <div />
          )}
          <span className="text-white/30 text-xs">{stepIndex + 1} / {TOTAL_STEPS}</span>
        </div>
      </div>

      {/* 슬라이딩 스텝 */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={stepIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 flex flex-col pb-10"
          >
            {steps[stepIndex]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
