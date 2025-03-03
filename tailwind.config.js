/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        blue: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        white: '#ffffff',
      },
      opacity: {
        '0': '0',
        '20': '0.2',
        '30': '0.3',
        '50': '0.5',
        '60': '0.6',
        '70': '0.7',
        '80': '0.8',
        '90': '0.9',
        '95': '0.95',
        '100': '1',
      }
    },
  },
  safelist: [
    'bg-white',
    'bg-white/90',
    'dark:bg-gray-800',
    'bg-blue-600',
    'bg-gray-800',
    'bg-opacity-90',
    'dark:bg-opacity-50',
    'text-white',
    'text-gray-800',
    'text-gray-900',
    'dark:text-white',
    {
      pattern: /(bg|text|border)-(white|black|gray|red|yellow|green|blue|indigo|purple|pink)(-\d+)?/,
    },
    {
      pattern: /(bg|text|border)-opacity-(\d+)/,
    },
    {
      pattern: /bg-(white|gray|blue)\/\d+/,
    }
  ],
  plugins: [],
}; 