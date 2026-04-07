import { useState, useRef, useEffect } from 'react'
import { useNameStore } from '../stores/nameStore'
import type { SurnameEntry, CityEntry } from '../lib/types'
import citiesData from '../data/cities.json'

const ALL_CITIES: CityEntry[] = citiesData as CityEntry[]
const MAJOR_CITIES = ALL_CITIES.filter(c => c.major)

// 시진(時辰) 기준 옵션 — value는 해당 시진 대표 시각(사주 계산에 사용)
const SIJIN_OPTIONS: { value: number | null; label: string }[] = [
  { value: null, label: '모름' },
  { value: 0,  label: '자시(子時)  23:30(전날) ~ 01:30' },
  { value: 2,  label: '축시(丑時)  01:30 ~ 03:30' },
  { value: 4,  label: '인시(寅時)  03:30 ~ 05:30' },
  { value: 6,  label: '묘시(卯時)  05:30 ~ 07:30' },
  { value: 8,  label: '진시(辰時)  07:30 ~ 09:30' },
  { value: 10, label: '사시(巳時)  09:30 ~ 11:30' },
  { value: 12, label: '오시(午時)  11:30 ~ 13:30' },
  { value: 14, label: '미시(未時)  13:30 ~ 15:30' },
  { value: 16, label: '신시(申時)  15:30 ~ 17:30' },
  { value: 18, label: '유시(酉時)  17:30 ~ 19:30' },
  { value: 20, label: '술시(戌時)  19:30 ~ 21:30' },
  { value: 22, label: '해시(亥時)  21:30 ~ 23:30' },
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

  // 연/월/일 분리 상태
  const [year, setYear] = useState('')
  const [month, setMonth] = useState('')
  const [day, setDay] = useState('')

  function handleDateChange(y: string, m: string, d: string) {
    if (y.length === 4 && m && d) {
      const mm = m.padStart(2, '0')
      const dd = d.padStart(2, '0')
      setInput({ birthdate: `${y}-${mm}-${dd}` })
    } else {
      setInput({ birthdate: '' })
    }
  }

  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const surnameInputRef = useRef<HTMLInputElement>(null)

  // 출생지 검색
  const [cityQuery, setCityQuery] = useState('')
  const [cityResults, setCityResults] = useState<CityEntry[]>([])
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const cityDropdownRef = useRef<HTMLDivElement>(null)
  const cityInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        cityDropdownRef.current && !cityDropdownRef.current.contains(e.target as Node) &&
        cityInputRef.current && !cityInputRef.current.contains(e.target as Node)
      ) {
        setShowCityDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleCityQuery(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value
    setCityQuery(q)
    if (q.length > 0) {
      setCityResults(ALL_CITIES.filter(c => c.name.includes(q)))
      setShowCityDropdown(true)
    } else {
      setCityResults([])
      setShowCityDropdown(false)
    }
  }

  function selectCity(city: CityEntry) {
    setInput({ birthCityName: city.name, birthLongitude: city.longitude })
    setCityQuery('')
    setShowCityDropdown(false)
  }

  function clearCity() {
    setInput({ birthCityName: '', birthLongitude: null })
  }

  function offsetLabel(longitude: number): string {
    const min = Math.round((longitude - 135) * 4)
    return min <= 0 ? `${min}분` : `+${min}분`
  }

  // 성씨 드롭다운 외부 클릭 시 닫기
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

  function handleSurnameSelect(entry: SurnameEntry, hanjaIndex: number) {
    const hanja = entry.hanja[hanjaIndex]
    selectSurname({
      reading: entry.reading,
      char: hanja.char,
      stroke: hanja.stroke,
      ohaeng: hanja.ohaeng,
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
      {/* 생년월일 + 시간 */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1.5 block">
          생년월일 · 시간
        </label>
        <div className="flex gap-2">
          {/* 연도 */}
          <input
            type="number"
            placeholder="연도"
            value={year}
            min={1900}
            max={2100}
            onChange={(e) => {
              setYear(e.target.value)
              handleDateChange(e.target.value, month, day)
            }}
            className="w-28 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold"
          />
          {/* 월 */}
          <input
            type="number"
            placeholder="월"
            value={month}
            min={1}
            max={12}
            onChange={(e) => {
              setMonth(e.target.value)
              handleDateChange(year, e.target.value, day)
            }}
            className="w-16 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold"
          />
          {/* 일 */}
          <input
            type="number"
            placeholder="일"
            value={day}
            min={1}
            max={31}
            onChange={(e) => {
              setDay(e.target.value)
              handleDateChange(year, month, e.target.value)
            }}
            className="w-16 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold"
          />
          {/* 시간 (시진 기준) */}
          <select
            value={input.birthHour === null ? '' : String(input.birthHour)}
            onChange={(e) => {
              const val = e.target.value
              setInput({ birthHour: val === '' ? null : Number(val) })
            }}
            className="flex-1 border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-gold"
          >
            {SIJIN_OPTIONS.map((opt) => (
              <option
                key={opt.value === null ? 'null' : opt.value}
                value={opt.value === null ? '' : String(opt.value)}
              >
                {opt.label}
              </option>
            ))}
          </select>
        </div>
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
            {surnameMatches.flatMap((entry) =>
              entry.hanja.map((h, idx) => (
                <button
                  key={`${entry.reading}-${h.char}`}
                  type="button"
                  onClick={() => handleSurnameSelect(entry, idx)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <span className="text-gray-900 font-medium">{entry.reading}</span>
                  <span className="font-serif text-gray-700">{h.char}</span>
                  <span className="text-gray-400 text-xs">{h.meaning}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* 출생지 */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1.5 block">
          출생지 <span className="text-xs text-gray-400 font-normal">(시간 보정, 선택)</span>
        </label>

        {/* 선택된 도시 표시 */}
        {input.birthCityName ? (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-700 font-medium">{input.birthCityName}</span>
            <span className="text-xs text-gold">
              ({offsetLabel(input.birthLongitude!)} 보정)
            </span>
            <button type="button" onClick={clearCity} className="text-xs text-gray-400 hover:text-gray-600 ml-auto">
              ✕ 해제
            </button>
          </div>
        ) : null}

        {/* 주요 도시 칩 */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {MAJOR_CITIES.map(city => (
            <button
              key={city.name}
              type="button"
              onClick={() => selectCity(city)}
              className={
                input.birthCityName === city.name
                  ? 'border border-gold bg-gold text-white rounded-full px-3 py-1 text-xs'
                  : 'border border-gray-200 rounded-full px-3 py-1 text-xs text-gray-600 hover:border-gold transition-colors'
              }
            >
              {city.name}
            </button>
          ))}
        </div>

        {/* 기타 도시 검색 */}
        <div className="relative">
          <input
            ref={cityInputRef}
            type="text"
            value={cityQuery}
            onChange={handleCityQuery}
            placeholder="도시명 검색 (예: 파주, Tokyo, New York)"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold"
            autoComplete="off"
          />
          {showCityDropdown && cityResults.length > 0 && (
            <div
              ref={cityDropdownRef}
              className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto"
            >
              {cityResults.map(city => (
                <button
                  key={city.name}
                  type="button"
                  onClick={() => selectCity(city)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex justify-between"
                >
                  <span className="text-gray-900">{city.name}</span>
                  <span className="text-xs text-gray-400">{offsetLabel(city.longitude)} 보정</span>
                </button>
              ))}
            </div>
          )}
          {showCityDropdown && cityQuery.length > 0 && cityResults.length === 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm text-gray-400">
              검색 결과 없음
            </div>
          )}
        </div>
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
