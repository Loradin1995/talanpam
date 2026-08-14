import { createContext, useContext, useState } from 'react';
import { t as translate } from './i18n';

const LangContext = createContext();

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'fr');

  const toggleLang = () => {
    const next = lang === 'fr' ? 'ht' : 'fr';
    setLang(next);
    localStorage.setItem('lang', next);
  };

  const t = (key) => translate(key, lang);

  return (
    <LangContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}