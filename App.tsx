
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import { QrGenerator } from './components/QrGenerator';
import QrScanner from './components/QrScanner';
import OfflineBanner from './components/OfflineBanner';
import LandingPageContent from './components/LandingPageContent';
import type { Theme, ActiveTab, DaylightColorTheme, TwilightColorTheme } from './types';

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('light');
  const [lightColorTheme, setLightColorTheme] = useState<DaylightColorTheme>('daybreak');
  const [darkColorTheme, setDarkColorTheme] = useState<TwilightColorTheme>('aurora');
  const [activeTab, setActiveTab] = useState<ActiveTab>('generate');

  useEffect(() => {
    // Restore light/dark theme
    const savedTheme = localStorage.getItem('qrlyph_theme') as Theme | null;
    const userPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (userPrefersDark ? 'dark' : 'light');
    setTheme(initialTheme);

    // Restore color themes
    const savedLightColorTheme = localStorage.getItem('qrlyph_light_color_theme') as DaylightColorTheme | null;
    if (savedLightColorTheme) {
      setLightColorTheme(savedLightColorTheme);
    }
    const savedDarkColorTheme = localStorage.getItem('qrlyph_dark_color_theme') as TwilightColorTheme | null;
    if (savedDarkColorTheme) {
      setDarkColorTheme(savedDarkColorTheme);
    }
  }, []);

  useEffect(() => {
    // Persist light/dark mode and apply the correct theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.dataset.theme = darkColorTheme;
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.dataset.theme = lightColorTheme;
    }
    localStorage.setItem('qrlyph_theme', theme);
  }, [theme, lightColorTheme, darkColorTheme]);

  useEffect(() => {
    // Persist light color theme choice
    localStorage.setItem('qrlyph_light_color_theme', lightColorTheme);
  }, [lightColorTheme]);

  useEffect(() => {
    // Persist dark color theme choice
    localStorage.setItem('qrlyph_dark_color_theme', darkColorTheme);
  }, [darkColorTheme]);
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'generate':
        return <QrGenerator theme={theme} />;
      case 'scan':
        return <QrScanner theme={theme} />;
      default:
        return null;
    }
  };

  return (
    <div className={`bg-background text-text-main min-h-screen transition-colors duration-300`}>
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        theme={theme} 
        setTheme={setTheme} 
        lightColorTheme={lightColorTheme}
        setLightColorTheme={setLightColorTheme}
        darkColorTheme={darkColorTheme}
        setDarkColorTheme={setDarkColorTheme}
      />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div key={activeTab} className="mt-4 animate-fade-in">
            {renderTabContent()}
        </div>
      </main>
      <LandingPageContent />
      <OfflineBanner />
    </div>
  );
};

export default App;
