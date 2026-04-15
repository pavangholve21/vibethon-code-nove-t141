/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'Consolas', 'monospace'],
      },
      colors: {
        cosmos: {
          bg: '#0A0A0F',
          surface: '#0F0F1A',
          surface2: '#151528',
          accent1: '#7C3AED',
          accent2: '#06B6D4',
          accent3: '#F59E0B',
          success: '#10B981',
          danger: '#EF4444',
          text: '#F1F5F9',
          text2: '#94A3B8',
        },
      },
      borderColor: {
        cosmos: 'rgba(124, 58, 237, 0.15)',
      },
      boxShadow: {
        glow: '0 20px 40px rgba(124,58,237,0.15)',
        glowCyan: '0 20px 40px rgba(6,182,212,0.12)',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-6px)' } },
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgba(124,58,237,0.35)' },
          '70%': { boxShadow: '0 0 0 10px rgba(124,58,237,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(124,58,237,0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '100% 50%' },
        },
        caretBlink: { '0%,49%': { opacity: 1 }, '50%,100%': { opacity: 0 } },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        pulseRing: 'pulseRing 1.8s ease-out infinite',
        shimmer: 'shimmer 1.2s ease-in-out infinite',
        caretBlink: 'caretBlink 1s steps(1) infinite',
      },
    },
  },
  plugins: [],
}

