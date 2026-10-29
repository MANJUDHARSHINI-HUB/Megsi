import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Loader2, AlertCircle, FlaskConical } from 'lucide-react';
import { OTP_LENGTH, RESEND_SECONDS, MAX_OTP_ATTEMPTS, maskEmail, sleep } from '../utils/demoAuth.js';

const EMPTY = Array(OTP_LENGTH).fill('');
const formatClock = (s) => `0:${String(s).padStart(2, '0')}`;

export default function OtpVerification({ user, otp, onVerified, onResend, onBack }) {
  const [digits, setDigits] = useState(EMPTY);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const inputs = useRef([]);
  const finished = useRef(false); // guards against verifying twice after a successful login

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);

  // A new code (first one, or a resend) resets the entry state.
  useEffect(() => {
    setDigits(EMPTY); setError(''); setAttempts(0); setNow(Date.now());
    inputs.current[0]?.focus();
  }, [otp.issuedAt]);

  const resendIn = Math.max(0, Math.ceil((otp.issuedAt + RESEND_SECONDS * 1000 - now) / 1000));
  const expired = now >= otp.expiresAt;
  const locked = attempts >= MAX_OTP_ATTEMPTS;

  function fill(startIndex, text) {
    const chars = text.replace(/\D/g, '').slice(0, OTP_LENGTH - startIndex).split('');
    if (!chars.length) return;
    const next = [...digits];
    chars.forEach((c, i) => { next[startIndex + i] = c; });
    setDigits(next);
    setError('');
    inputs.current[Math.min(startIndex + chars.length, OTP_LENGTH - 1)]?.focus();
  }

  function handleChange(i, e) {
    const value = e.target.value.replace(/\D/g, '');
    if (!value) { const next = [...digits]; next[i] = ''; setDigits(next); return; }
    fill(i, value); // handles a single digit, an autofilled code, or multi-character input
  }

  function handleKeyDown(i, e) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      e.preventDefault();
      const next = [...digits]; next[i - 1] = ''; setDigits(next);
      inputs.current[i - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && i > 0) { e.preventDefault(); inputs.current[i - 1]?.focus(); }
    else if (e.key === 'ArrowRight' && i < OTP_LENGTH - 1) { e.preventDefault(); inputs.current[i + 1]?.focus(); }
  }

  function handlePaste(i, e) {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    fill(text.replace(/\D/g, '').length >= OTP_LENGTH ? 0 : i, text); // a full pasted code always starts at box 1
  }

  async function handleVerify(e) {
    e.preventDefault();
    if (busy || finished.current) return;
    const entered = digits.join('');
    if (entered.length < OTP_LENGTH) { setError(`Enter all ${OTP_LENGTH} digits of the code.`); inputs.current[digits.findIndex((d) => !d)]?.focus(); return; }
    if (expired) { setError('This code has expired. Request a new code.'); return; }
    if (locked) { setError('Too many incorrect attempts. Request a new code.'); return; }

    setBusy(true); setNotice('');
    await sleep(700);
    if (entered === otp.code) {
      finished.current = true;
      onVerified();
      return;
    }
    const used = attempts + 1;
    setAttempts(used); setBusy(false); setDigits(EMPTY);
    setError(used >= MAX_OTP_ATTEMPTS
      ? 'Too many incorrect attempts. Request a new code.'
      : `Incorrect code. ${MAX_OTP_ATTEMPTS - used} ${MAX_OTP_ATTEMPTS - used === 1 ? 'attempt' : 'attempts'} remaining.`);
    inputs.current[0]?.focus();
  }

  function handleResend() {
    if (resendIn > 0 || busy) return;
    onResend();
    setNotice('A new demo code has been generated. The previous code no longer works.');
  }

  return (
    <form onSubmit={handleVerify} noValidate className="form">
      <p className="lead">
        We would send a six-digit code to <b>{maskEmail(user.email)}</b>. This demo does not send email, so use the demo code below.
      </p>

      <div className="demo-panel" role="note">
        <span className="demo-tag"><FlaskConical size={14} aria-hidden="true" />Demo only</span>
        <p>No email was sent. Development code for <b>{user.username}</b>:</p>
        <div className="demo-code-row">
          <code aria-label={`Demo code ${otp.code.split('').join(' ')}`}>{otp.code}</code>
          <button type="button" className="btn ghost small" onClick={() => fill(0, otp.code)}>Autofill code</button>
        </div>
      </div>

      <fieldset className="otp" aria-describedby={error ? 'otp-error' : undefined}>
        <legend>Verification code</legend>
        <div className="otp-grid">
          {digits.map((d, i) => (
            <input key={i} ref={(el) => (inputs.current[i] = el)} value={d} inputMode="numeric" pattern="[0-9]*"
              autoComplete={i === 0 ? 'one-time-code' : 'off'} aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`}
              aria-invalid={error ? 'true' : undefined} disabled={busy}
              onChange={(e) => handleChange(i, e)} onKeyDown={(e) => handleKeyDown(i, e)} onPaste={(e) => handlePaste(i, e)}
              onFocus={(e) => e.target.select()} />
          ))}
        </div>
        {error && <p id="otp-error" className="field-error" role="alert"><AlertCircle size={15} aria-hidden="true" /><span>{error}</span></p>}
        {!error && expired && <p className="field-error"><AlertCircle size={15} aria-hidden="true" /><span>This code has expired. Request a new code.</span></p>}
      </fieldset>

      <button type="submit" className="btn primary" disabled={busy}>
        {busy ? (<><Loader2 className="spin" size={18} aria-hidden="true" />Verifying…</>) : 'Verify OTP'}
      </button>

      <div className="otp-actions">
        <button type="button" className="link-btn" onClick={onBack} disabled={busy}><ArrowLeft size={16} aria-hidden="true" />Back to sign in</button>
        <button type="button" className="link-btn" onClick={handleResend} disabled={resendIn > 0 || busy}>
          {resendIn > 0 ? `Resend code in ${formatClock(resendIn)}` : 'Resend code'}
        </button>
      </div>
      <p className="sr-only" aria-live="polite">{notice}</p>
      {notice && <p className="banner info">{notice}</p>}
    </form>
  );
}
