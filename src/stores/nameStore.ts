import { create } from 'zustand'
import { computeSaju } from '../lib/saju'
import { extractYongsin } from '../lib/yongsin'
import { generateNames } from '../lib/generator'
import surnamesData from '../data/surnames.json'
import type { InputState, ResultState, SelectedSurname, SurnameEntry } from '../lib/types'

const ALL_SURNAMES: SurnameEntry[] = surnamesData as SurnameEntry[]

const initialInput: InputState = {
  birthdate: '',
  birthHour: null,
  birthCityName: '',
  birthLongitude: null,
  gender: 'neutral',
  surnameReading: '',
  selectedSurname: null,
  nameLength: 2,
}

/** 경도 기반 진태양시 보정: (경도 - 135) × 4분 */
function applyLongitudeCorrection(
  birthdate: string,
  birthHour: number | null,
  birthLongitude: number | null
): { date: string; hour: number | null } {
  if (birthHour === null || birthLongitude === null) {
    return { date: birthdate, hour: birthHour }
  }
  const offsetMinutes = Math.round((birthLongitude - 135) * 4)
  let totalMinutes = birthHour * 60 + offsetMinutes
  let adjustedDate = birthdate

  if (totalMinutes < 0) {
    totalMinutes += 24 * 60
    const d = new Date(birthdate + 'T12:00:00Z')
    d.setUTCDate(d.getUTCDate() - 1)
    adjustedDate = d.toISOString().slice(0, 10)
  } else if (totalMinutes >= 24 * 60) {
    totalMinutes -= 24 * 60
    const d = new Date(birthdate + 'T12:00:00Z')
    d.setUTCDate(d.getUTCDate() + 1)
    adjustedDate = d.toISOString().slice(0, 10)
  }

  return { date: adjustedDate, hour: Math.floor(totalMinutes / 60) }
}

const initialResult: ResultState = {
  saju: null,
  yongsin: [],
  candidates: [],
  isLoading: false,
  error: null,
}

interface NameStore {
  input: InputState
  result: ResultState
  surnameMatches: SurnameEntry[]
  setInput: (partial: Partial<InputState>) => void
  searchSurname: (reading: string) => void
  selectSurname: (surname: SelectedSurname) => void
  generate: () => Promise<void>
  reset: () => void
}

export const useNameStore = create<NameStore>((set, get) => ({
  input: initialInput,
  result: initialResult,
  surnameMatches: [],

  setInput: (partial) =>
    set(s => ({ input: { ...s.input, ...partial } })),

  searchSurname: (reading) => {
    const matches = reading
      ? ALL_SURNAMES.filter(s => s.reading.startsWith(reading))
      : []
    set({ surnameMatches: matches })
  },

  selectSurname: (surname) =>
    set(s => ({ input: { ...s.input, selectedSurname: surname, surnameReading: surname.reading } })),

  generate: async () => {
    const { input } = get()
    if (!input.selectedSurname || !input.birthdate) {
      set(s => ({ result: { ...s.result, error: '생년월일과 성씨를 입력해주세요.' } }))
      return
    }
    set(s => ({ result: { ...s.result, isLoading: true, error: null } }))
    try {
      const { date, hour } = applyLongitudeCorrection(input.birthdate, input.birthHour, input.birthLongitude)
      const saju = computeSaju(date, hour)
      const yongsin = extractYongsin(saju)
      const candidates = generateNames(input, yongsin)
      set({ result: { saju, yongsin, candidates, isLoading: false, error: null } })
    } catch (err) {
      const msg = err instanceof Error ? err.message : '이름 생성 중 오류가 발생했습니다.'
      set(s => ({ result: { ...s.result, isLoading: false, error: msg } }))
    }
  },

  reset: () => set({ input: initialInput, result: initialResult, surnameMatches: [] }),
}))
