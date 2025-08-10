import React, { useState, useEffect } from 'react';
import type { ActiveTab, Theme, DaylightColorTheme, TwilightColorTheme } from '../types';
import ThemeToggle from './ThemeToggle';
import { IconGrid, IconScanner } from './icons';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  lightColorTheme: DaylightColorTheme;
  setLightColorTheme: (theme: DaylightColorTheme) => void;
  darkColorTheme: TwilightColorTheme;
  setDarkColorTheme: (theme: TwilightColorTheme) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, theme, setTheme, lightColorTheme, setLightColorTheme, darkColorTheme, setDarkColorTheme }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navClass = `fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
    isScrolled 
      ? 'bg-background/80 backdrop-blur-md border-b border-border' 
      : 'bg-transparent'
  }`;

  const getTabClass = (tabName: ActiveTab) =>
    `flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
      activeTab === tabName
        ? 'bg-primary text-on-primary'
        : 'text-text-subtle hover:bg-border/60'
    }`;

  return (
    <nav className={navClass}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <h1 className="text-xl sm:text-2xl font-bold text-inherit tracking-wider">QRlyph</h1>
          </div>
          
          <div className="absolute left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-1 bg-surface p-1 rounded-full shadow-sm">
              <button onClick={() => setActiveTab('generate')} className={getTabClass('generate')} aria-label="Generate QR Code">
                <IconGrid className="w-5 h-5"/>
                <span className="hidden sm:inline">Generate</span>
              </button>
              <button onClick={() => setActiveTab('scan')} className={getTabClass('scan')} aria-label="Scan QR Code">
                <IconScanner className="w-5 h-5"/>
                <span className="hidden sm:inline">Scan</span>
              </button>
            </div>
          </div>

          <div className="flex-shrink-0">
            <ThemeToggle 
              theme={theme} 
              setTheme={setTheme} 
              lightColorTheme={lightColorTheme}
              setLightColorTheme={setLightColorTheme}
              darkColorTheme={darkColorTheme}
              setDarkColorTheme={setDarkColorTheme}
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;