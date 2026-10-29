import { useMemo } from 'react';
import { RefreshCw } from 'lucide-react';
import FormField from './FormField.jsx';

// Demo CAPTCHA: the parent owns the challenge string so it can compare it on submit.
// This is a frontend illustration only and gives no real bot protection.
export default function Captcha({ challenge, value, onChange, onRefresh, error }) {
  // Slight per-character tilt/offset so the text looks like a challenge, derived from the characters
  // themselves so it stays stable while the user types.
  const glyphs = useMemo(
    () =>
      challenge.split('').map((ch, i) => {
        const n = ch.charCodeAt(0) + i * 13;
        return { ch, rotate: (n % 17) - 8, lift: (n % 7) - 3 };
      }),
    [challenge]
  );

  return (
    <div className="captcha" role="group" aria-label="CAPTCHA verification">
      <div className="captcha-row">
        <div className="captcha-box" role="img" aria-label={`CAPTCHA characters: ${challenge.split('').join(' ')}`}>
          <svg className="captcha-noise" viewBox="0 0 200 56" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 14 C40 40, 80 0, 120 28 S180 44, 200 18" />
            <path d="M0 44 C50 10, 90 52, 130 22 S180 8, 200 40" />
          </svg>
          <span className="captcha-text" aria-hidden="true">
            {glyphs.map((g, i) => (
              <span key={i} style={{ transform: `translateY(${g.lift}px) rotate(${g.rotate}deg)` }}>{g.ch}</span>
            ))}
          </span>
        </div>
        <button type="button" className="icon-btn" onClick={onRefresh} aria-label="Get a new CAPTCHA challenge" title="New challenge">
          <RefreshCw size={18} aria-hidden="true" />
        </button>
      </div>
      <FormField
        id="captcha"
        label="CAPTCHA verification"
        placeholder="Type the characters shown above"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        error={error}
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck="false"
        maxLength={12}
      />
    </div>
  );
}
