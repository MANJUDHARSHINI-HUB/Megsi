import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

// Accessible dialog shell: portal, aria-modal, focus trap, Esc to close, scroll lock, focus restore.
export default function PlanModal({ title, titleId, size = 'md', busy = false, onClose, children }) {
  const ref = useRef(null);
  const [opener] = useState(() => document.activeElement); // captured before any child effect moves focus
  const live = useRef({ onClose, busy });
  live.current = { onClose, busy };

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (!ref.current.contains(document.activeElement)) ref.current.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') { if (!live.current.busy) { e.stopPropagation(); live.current.onClose(); } return; }
      if (e.key !== 'Tab') return;
      const items = [...ref.current.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
      if (!items.length) { e.preventDefault(); return; }
      const first = items[0], last = items[items.length - 1], a = document.activeElement;
      if (e.shiftKey && (a === first || a === ref.current)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && a === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      if (opener && document.contains(opener)) opener.focus();
    };
  }, [opener]);

  return createPortal(
    <div className="spm" onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}>
      <div className={`spm-dialog ${size}`} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-busy={busy} tabIndex={-1} ref={ref}>
        <div className="spm-h">
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="spm-x" onClick={onClose} disabled={busy} aria-label="Close dialog"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
