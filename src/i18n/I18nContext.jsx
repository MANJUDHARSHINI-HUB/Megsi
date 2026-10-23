import { createContext, useContext, useMemo, useState } from 'react';
import { TRANSLATIONS, fmtDate, fmtDateTime, monthShort } from './translations.js';

const Ctx = createContext(null);
export function I18nProvider({ children }) {
  const [lang, setLang] = useState('en');
  const value = useMemo(() => ({
    lang, setLang,
    t: (k, p) => {
      let s = TRANSLATIONS[lang][k] ?? TRANSLATIONS.en[k] ?? k;
      if (p) for (const x in p) s = s.split(`{${x}}`).join(p[x]);
      return s;
    },
    fmtDate: (iso) => fmtDate(iso, lang), fmtDateTime: (iso) => fmtDateTime(iso, lang), monthShort: (k) => monthShort(k, lang),
  }), [lang]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const useI18n = () => useContext(Ctx);
