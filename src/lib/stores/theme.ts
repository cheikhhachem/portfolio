import { writable } from 'svelte/store';

type Theme = 'light' | 'dark';

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  
  const stored = localStorage.getItem('color-mode');
  if (stored === 'dark-mode' || stored === 'dark') return 'dark';
  if (stored === 'light-mode' || stored === 'light') return 'light';
  
  return 'light';
};

const createThemeStore = () => {
  const { subscribe, set, update } = writable<Theme>(getInitialTheme());

  return {
    subscribe,
    toggle: () => {
      update(current => {
        const newTheme = current === 'light' ? 'dark' : 'light';
        if (typeof window !== 'undefined') {
          localStorage.setItem('color-mode', newTheme);
          document.documentElement.classList.remove('light-mode', 'dark-mode');
          document.documentElement.classList.add(`${newTheme}-mode`);
        }
        return newTheme;
      });
    },
    set: (value: Theme) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('color-mode', value);
        document.documentElement.classList.remove('light-mode', 'dark-mode');
        document.documentElement.classList.add(`${value}-mode`);
      }
      set(value);
    }
  };
};

export const theme = createThemeStore();
