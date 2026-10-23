import { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { Menu } from './Common.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';
import { PRESETS } from '../data/selectors.js';

export default function DateRangeMenu({ range, setRange }) {
  const { t, fmtDate } = useI18n();
  const [s, setS] = useState(range.start), [e, setE] = useState(range.end), [err, setErr] = useState(false);
  return (
    <Menu cls="date-pop" button={<span className="date"><Calendar size={17} />{fmtDate(range.start)} - {fmtDate(range.end)}<ChevronDown size={14} /></span>}>
      {(close) => (<>
        {PRESETS.map((p) => (
          <div key={p.id} className={`item ${p.start === range.start && p.end === range.end ? 'sel' : ''}`}
            onClick={() => { setRange({ start: p.start, end: p.end }); setS(p.start); setE(p.end); setErr(false); close(); }}>
            {t(`preset.${p.id}`)}<small>{fmtDate(p.start)} – {fmtDate(p.end)}</small></div>))}
        <div className="custom"><b>{t('date.custom')}</b>
          <label>{t('date.from')}<input type="date" value={s} onChange={(ev) => setS(ev.target.value)} /></label>
          <label>{t('date.to')}<input type="date" value={e} onChange={(ev) => setE(ev.target.value)} /></label>
          {err && <span className="err">{t('date.invalid')}</span>}
          <button className="btn-primary sm" onClick={() => { if (!s || !e || s > e) { setErr(true); return; } setErr(false); setRange({ start: s, end: e }); close(); }}>{t('date.apply')}</button>
        </div>
      </>)}
    </Menu>
  );
}
