import { createContext, useContext, useMemo, useState } from 'react';
import {
TRANSLATIONS,
fmtDate,
fmtDateTime,
monthShort,
} from './translations.js';

const Ctx = createContext(null);

export function I18nProvider({ children }) {
const [lang, setLangState] = useState('en');

const setLang = (nextLang) => {
if (Object.prototype.hasOwnProperty.call(TRANSLATIONS, nextLang)) {
setLangState(nextLang);
}
};

const value = useMemo(() => ({
lang,
setLang,


t: (key, params) => {
  let text =
    TRANSLATIONS[lang]?.[key] ??
    TRANSLATIONS.en[key] ??
    key;

  if (params) {
    for (const [name, replacement] of Object.entries(params)) {
      text = text.split(`{${name}}`).join(String(replacement));
    }
  }

  return text;
},

fmtDate: (iso) => fmtDate(iso, lang),
fmtDateTime: (iso) => fmtDateTime(iso, lang),
monthShort: (key) => monthShort(key, lang),


}), [lang]);

return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);
