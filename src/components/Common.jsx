import { useEffect, useRef, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext.jsx';

export const StatusBadge = ({ v }) => {
  const { t } = useI18n();
  const c = { Active: 'green', Operational: 'green', Trial: 'orange', Suspended: 'red' }[v] || 'blue';
  return <span className={`badge ${c}`}><i className="dot" />{t(`status.${v}`)}</span>;
};
export const PlanBadge = ({ v }) => <span className={`plan ${v}`}>{v}</span>;

export function Menu({ button, children, align = 'right', cls = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const k = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', h); document.addEventListener('keydown', k);
    return () => { document.removeEventListener('mousedown', h); document.removeEventListener('keydown', k); };
  }, [open]);
  return (
    <div className="menu-wrap" ref={ref}>
      <div className="menu-btn" onClick={() => setOpen((o) => !o)}>{button}</div>
      {open && <div className={`pop ${align} ${cls}`}>{children(() => setOpen(false))}</div>}
    </div>
  );
}

export const Select = ({ value, options, onChange, format = (x) => x }) => (
  <Menu button={<span className="select">{format(value)}<ChevronDown size={14} /></span>}>
    {(close) => options.map((o) => (
      <div key={o} className={`item ${o === value ? 'sel' : ''}`} onClick={() => { onChange(o); close(); }}>{format(o)}</div>
    ))}
  </Menu>
);

export const Avatar = ({ name }) => {
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return <span className="av" style={{ background: `hsl(${hue} 45% 22%)` }}>{name.split(' ').map((w) => w[0]).slice(0, 2).join('')}</span>;
};

export function DetailPanel({ data, onClose }) {
  const { t } = useI18n();
  if (!data) return null;
  return (
    <>
      <div className="backdrop" onClick={onClose} />
      <aside className="detail">
        <div className="detail-h"><h3>{data.title}</h3><button className="icon-btn" onClick={onClose} aria-label={t('close')}><X size={18} /></button></div>
        <div className="detail-b">
          {data.rows.map(([k, v]) => <div className="kv" key={k}><span>{k}</span><b>{v}</b></div>)}
          <p className="demo-note">{t('demoNote')}</p>
        </div>
      </aside>
    </>
  );
}
