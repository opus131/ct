import { createContext, useContext, createEffect, type ParentProps } from 'solid-js';
import { createStore } from 'solid-js/store';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>();

export function ThemeProvider(props: ParentProps) {
  // Initialize theme from localStorage or default to dark
  const getInitialTheme = (): Theme => {
    if (typeof window === 'undefined') return 'dark';
    const stored = localStorage.getItem('theme') as Theme | null;
    return stored || 'dark';
  };

  const [state, setState] = createStore({
    theme: getInitialTheme(),
  });

  const toggleTheme = () => {
    setState('theme', (current) => {
      const newTheme = current === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };

  // Apply theme to document
  createEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', state.theme);
    }
  });

  const value: ThemeContextValue = {
    get theme() {
      return state.theme;
    },
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {props.children}
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
