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
  gender: 'neutral',
  surnameReading: '',
  selectedSurname: null,
  nameLength: 2,
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
      const saju = computeSaju(input.birthdate, input.birthHour)
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
