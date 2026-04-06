import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: '#C9A84C',
        'gold-light': '#E8C97A',
        wood: '#4CAF50',
        fire: '#F44336',
        earth: '#FF9800',
        metal: '#9E9E9E',
        water: '#2196F3',
      },
      fontFamily: {
        serif: ['Noto Serif KR', 'serif'],
        sans: ['Pretendard', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
