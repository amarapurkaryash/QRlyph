
import React, { useState, useRef, useEffect } from 'react';
import type { Theme, DaylightColorTheme, TwilightColorTheme, ColorTheme } from '../types';
import { IconDarkMode, IconLightMode, IconColorLens, IconCheck } from './icons';

// Define theme configurations for the picker UI
const DAYLIGHT_THEMES: { name: DaylightColorTheme; primary: string; accent: string; label: string }[] = [
  { name: 'daybreak', primary: '#0369a1', accent: '#f59e0b', label: 'Daybreak' },
  { name: 'meadow', primary: '#15803d', accent: '#14b8a6', label: 'Meadow' },
  { name: 'sunset', primary: '#be123c', accent: '#9333ea', label: 'Sunset' },
  { name: 'blossom', primary: '#db2777', accent: '#d946ef', label: 'Blossom' },
  { name: 'stream', primary: '#6366f1', accent: '#a855f7', label: 'Stream' },
];

const TWILIGHT_THEMES: { name: TwilightColorTheme; primary: string; accent: string; label: string }[] = [
  { name: 'midnight', primary: '#818cf8', accent: '#c084fc', label: 'Midnight' },
  { name: 'aurora', primary: '#4ade80', accent: '#2dd4bf', label: 'Aurora' },
  { name: 'dusk', primary: '#fb923c', accent: '#fb7185', label: 'Dusk' },
  { name: 'ember', primary: '#f87171', accent: '#facc15', label: 'Ember' },
  { name: 'cyber', primary: '#22d3ee', accent: '#ec4899', label: 'Cyber' },
];


interface ThemeToggleProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  lightColorTheme: DaylightColorTheme;
  setLightColorTheme: (theme: DaylightColorTheme) => void;
  darkColorTheme: TwilightColorTheme;
  setDarkColorTheme: (theme: TwilightColorTheme) => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, setTheme, lightColorTheme, setLightColorTheme, darkColorTheme, setDarkColorTheme }) => {
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const paletteRef = useRef<HTMLDivElement>(null);

  const toggleLightDark = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Close palette on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (paletteRef.current && !paletteRef.current.contains(event.target as Node)) {
        setIsPaletteOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const isDarkMode = theme === 'dark';
  const currentThemes = isDarkMode ? TWILIGHT_THEMES : DAYLIGHT_THEMES;
  const currentColorTheme = isDarkMode ? darkColorTheme : lightColorTheme;
  const setCurrentColorTheme = isDarkMode ? setDarkColorTheme : setLightColorTheme;
  const paletteTitle = isDarkMode ? "Twilight Palettes" : "Daylight Palettes";

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {/* Color Palette Switcher */}
      <div className="relative" ref={paletteRef}>
        <button
          onClick={() => setIsPaletteOpen(!isPaletteOpen)}
          className="p-2 rounded-full text-text-subtle hover:bg-surface transition-colors"
          aria-label="Change color theme"
        >
          <IconColorLens className="w-6 h-6" />
        </button>
        {isPaletteOpen && (
          <div className="absolute top-full right-0 mt-2 w-56 bg-surface border border-border rounded-xl shadow-lg p-2 z-50 animate-fade-in-scale">
            <div className="px-2 py-1.5">
                <h4 className="font-semibold text-sm text-text-main">{paletteTitle}</h4>
                <p className="text-xs text-text-subtle">For {isDarkMode ? 'dark' : 'light'} mode</p>
            </div>
            <div className="mt-1 flex flex-col gap-1">
              {currentThemes.map((t) => (
                <button
                  key={t.name}
                  onClick={() => {
                    (setCurrentColorTheme as (theme: ColorTheme) => void)(t.name);
                    setIsPaletteOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-accent ${currentColorTheme === t.name ? 'bg-primary/20' : 'hover:bg-border/60'}`}
                  aria-label={`Switch to ${t.label} theme`}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden flex shadow-inner border border-border/50">
                     <div className="w-1/2 h-full" style={{ backgroundColor: t.primary }}></div>
                     <div className="w-1/2 h-full" style={{ backgroundColor: t.accent }}></div>
                  </div>
                  <span className="flex-1 font-semibold text-sm capitalize text-text-main">
                    {t.label}
                  </span>
                  {currentColorTheme === t.name && (
                    <IconCheck className="w-5 h-5 text-primary"/>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Light/Dark Mode Toggle */}
      <button
        onClick={toggleLightDark}
        className="p-2 rounded-full text-text-subtle hover:bg-surface transition-colors"
        aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      >
        {theme === 'light' ? <IconDarkMode className="w-6 h-6" /> : <IconLightMode className="w-6 h-6" />}
      </button>
    </div>
  );
};

export default ThemeToggle;