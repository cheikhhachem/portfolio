import { writable } from 'svelte/store';

export type Language = 'fr' | 'ar' | 'en';

const getInitialLanguage = (): Language => {
  if (typeof window === 'undefined') return 'fr';
  
  const stored = localStorage.getItem('selected-language');
  if (stored && ['fr', 'ar', 'en'].includes(stored)) {
    return stored as Language;
  }
  
  const browserLang = navigator.language.split('-')[0];
  return ['fr', 'ar', 'en'].includes(browserLang) ? browserLang as Language : 'fr';
};

const createLanguageStore = () => {
  const { subscribe, set } = writable<Language>(getInitialLanguage());

  return {
    subscribe,
    set: (value: Language) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('selected-language', value);
        document.documentElement.lang = value;
        document.documentElement.dir = value === 'ar' ? 'rtl' : 'ltr';
      }
      set(value);
    }
  };
};

export const language = createLanguageStore();
