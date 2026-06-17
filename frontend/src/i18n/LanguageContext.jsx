import React, { createContext, useState, useEffect } from 'react';
import es from './es.json';
import en from './en.json';

const dictionaries = { es, en };

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('appLang') || 'es';
  });

  useEffect(() => {
    localStorage.setItem('appLang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key) => {
    const keys = key.split('.');
    let result = dictionaries[lang];
    for (const k of keys) {
      if (result && result[k] !== undefined) {
        result = result[k];
      } else {
        return key; // Si no encuentra la clave, muestra la clave misma
      }
    }
    return result;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
