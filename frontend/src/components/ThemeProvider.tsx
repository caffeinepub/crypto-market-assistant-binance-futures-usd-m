import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type ThemeType = 'darkNeon' | 'cyberGlow';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>(() => {
    const stored = localStorage.getItem('app-theme');
    return (stored === 'cyberGlow' ? 'cyberGlow' : 'darkNeon') as ThemeType;
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove both theme classes first
    root.classList.remove('theme-dark-neon', 'theme-cyber-glow');
    
    // Add the selected theme class
    const themeClass = theme === 'cyberGlow' ? 'theme-cyber-glow' : 'theme-dark-neon';
    root.classList.add(themeClass);
    
    // Save to localStorage
    localStorage.setItem('app-theme', theme);
    
    // Force a reflow to ensure CSS variables are updated immediately
    void root.offsetHeight;
  }, [theme]);

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

