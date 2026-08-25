import { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  const isDark = theme === 'dark';

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.setProperty('--toast-bg', '#1e293b');
      root.style.setProperty('--toast-color', '#f8fafc');
      root.style.setProperty('--toast-border', '#334155');
    } else {
      root.classList.remove('dark');
      root.style.setProperty('--toast-bg', '#ffffff');
      root.style.setProperty('--toast-color', '#0f172a');
      root.style.setProperty('--toast-border', '#e2e8f0');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
