import { useState, useRef, useEffect } from 'react'
import { useNameStore } from '../stores/nameStore'
import type { SurnameEntry } from '../lib/types'

function getTimeSlotLabel(hour: number): string {
  if (hour === 0 || hour === 23) return '자시(子)'
  if (hour === 1 || hour === 2) return '축시(丑)'
  if (hour === 3 || hour === 4) return '인시(寅)'
  if (hour === 5 || hour === 6) return '묘시(卯)'
  if (hour === 7 || hour === 8) return '진시(辰)'
  if (hour === 9 || hour === 10) return '사시(巳)'
  if (hour === 11 || hour === 12) return '오시(午)'
  if (hour === 13 || hour === 14) return '미시(未)'
  if (hour === 15 || hour === 16) return '신시(申)'
  if (hour === 17 || hour === 18) return '유시(酉)'
  if (hour === 19 || hour === 20) return '술시(戌)'
  if (hour === 21 || hour === 22) return '해시(亥)'
  return ''
}

const HOUR_OPTIONS: { value: number | null; label: string }[] = [
  { value: null, label: '모름' },
  ...Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label: `${i}시 (${getTimeSlotLabel(i)})`,
  })),
]

export function InputForm() {
  const {
    input,
    result,
    surnameMatches,
    setInput,
    searchSurname,
    selectSurname,
    generate,
  } = useNameStore()

  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const surnameInputRef = useRef<HTMLInputElement>(null)

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        surnameInputRef.current &&
        !surnameInputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSurnameInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setInput({ surnameReading: val, selectedSurname: null })
    searchSurname(val)
    setShowDropdown(val.length > 0)
  }

  function handleSurnameSelect(entry: SurnameEntry) {
    const firstHanja = entry.hanja[0]
    selectSurname({
      reading: entry.reading,
      char: firstHanja.char,
      stroke: firstHanja.stroke,
      ohaeng: firstHanja.ohaeng,
    })
    setShowDropdown(false)
  }

  const inputBase =
    'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold'

  const toggleActive =
    'border border-gold bg-gold text-white rounded-lg px-3 py-2 text-sm'
  const toggleInactive =
    'border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 hover:border-gold transition-colors'

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        generate()
      }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5"
    >
      {/* 생년월일 */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1.5 block">
          생년월일
        </label>
        <input
          type="date"
          value={input.birthdate}
          onChange={(e) => setInput({ birthdate: e.target.value })}
          className={inputBase}
          required
        />
      </div>

      {/* 태어난 시간 */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1.5 block">
          태어난 시간
        </label>
        <select
          value={input.birthHour === null ? '' : String(input.birthHour)}
          onChange={(e) => {
            const val = e.target.value
            setInput({ birthHour: val === '' ? null : Number(val) })
          }}
          className={inputBase}
        >
          {HOUR_OPTIONS.map((opt) => (
            <option
              key={opt.value === null ? 'null' : opt.value}
              value={opt.value === null ? '' : String(opt.value)}
            >
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* 성별 */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1.5 block">
          성별
        </label>
        <div className="flex gap-2">
          {(
            [
              { value: 'male', label: '남아' },
              { value: 'female', label: '여아' },
              { value: 'neutral', label: '성별 무관' },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setInput({ gender: opt.value })}
              className={input.gender === opt.value ? toggleActive : toggleInactive}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 성씨 입력 + 자동완성 */}
      <div className="relative">
        <label className="text-sm font-medium text-gray-700 mb-1.5 block">
          성씨
        </label>
        <div className="relative">
          <input
            ref={surnameInputRef}
            type="text"
            value={input.surnameReading}
            onChange={handleSurnameInput}
            onFocus={() => {
              if (input.surnameReading.length > 0 && surnameMatches.length > 0) {
                setShowDropdown(true)
              }
            }}
            placeholder="성씨를 입력하세요 (예: 김)"
            className={inputBase}
            autoComplete="off"
          />
          {input.selectedSurname && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gold font-medium">
              {input.selectedSurname.char}
            </span>
          )}
        </div>

        {/* 드롭다운 */}
        {showDropdown && surnameMatches.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
          >
            {surnameMatches.map((entry) => (
              <button
                key={entry.reading}
                type="button"
                onClick={() => handleSurnameSelect(entry)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <span className="text-gray-900 font-medium">{entry.reading}</span>
                <span className="text-gray-400 text-xs">
                  {entry.hanja.map((h) => h.char).join(' / ')}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 이름 글자 수 */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1.5 block">
          이름 글자 수
        </label>
        <div className="flex gap-2">
          {(
            [
              { value: 1, label: '1자' },
              { value: 2, label: '2자' },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setInput({ nameLength: opt.value })}
              className={input.nameLength === opt.value ? toggleActive : toggleInactive}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 에러 표시 */}
      {result.error && (
        <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">
          {result.error}
        </p>
      )}

      {/* 이름 생성 버튼 */}
      <button
        type="submit"
        disabled={result.isLoading}
        className="w-full bg-gold hover:bg-gold-light text-white font-semibold py-3 rounded-xl text-base transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {result.isLoading ? '생성 중...' : '이름 생성'}
      </button>
    </form>
  )
}
