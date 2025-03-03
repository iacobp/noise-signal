'use client';

import React from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full transition-colors hover:bg-gray-700 hover:bg-opacity-50 dark:hover:bg-gray-700 dark:hover:bg-opacity-50"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <FiSun className="text-yellow-300" size={20} />
      ) : (
        <FiMoon className="text-blue-400" size={20} />
      )}
    </button>
  );
} 