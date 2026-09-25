import { create } from 'zustand';

export type ThemeMode = 'dark' | 'light';

interface ThemeState {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'dark';
  try {
    const saved = localStorage.getItem('intelforge-theme') as ThemeMode | null;
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  } catch (e) {
    // localStorage might be unavailable
  }
  return 'dark'; // Dark mode default as established in project
};

export const useThemeStore = create<ThemeState>((set, get) => {
  const initial = getInitialTheme();

  // Synchronize documentElement classes immediately
  if (typeof document !== 'undefined') {
    if (initial === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }

  return {
    theme: initial,
    toggleTheme: () => {
      const current = get().theme;
      const next: ThemeMode = current === 'dark' ? 'light' : 'dark';
      get().setTheme(next);
    },
    setTheme: (theme: ThemeMode) => {
      try {
        localStorage.setItem('intelforge-theme', theme);
      } catch (e) {
        // ignore storage errors
      }

      if (typeof document !== 'undefined') {
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.add('light');
        }
      }

      set({ theme });
    },
  };
});
