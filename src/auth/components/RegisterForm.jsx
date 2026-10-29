import { useState } from 'react';
import { User, Mail, AtSign, Loader2 } from 'lucide-react';
import FormField from './FormField.jsx';
import Captcha from './Captcha.jsx';
import { ROLES, validateFullName, validateEmail, validateUsername, validateRole, validateCaptcha, compact } from '../utils/validation.js';
import { generateCaptcha, saveUser, sleep } from '../utils/demoAuth.js';

const FIELD_IDS = { fullName: 'rg-fullName', email: 'rg-email', username: 'rg-username', role: 'rg-role', captcha: 'captcha' };
const FIELD_ORDER = ['fullName', 'email', 'username', 'role', 'captcha'];

export default function RegisterForm({ onRegistered }) {
  const [values, setValues] = useState({ fullName: '', email: '', username: '', role: '' });
  const [challenge, setChallenge] = useState(() => generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const clearError = (field) => errors[field] && setErrors((er) => ({ ...er, [field]: '' }));
  const set = (field) => (e) => { setValues((v) => ({ ...v, [field]: e.target.value })); clearError(field); };

  const newChallenge = () => { setChallenge(generateCaptcha()); setCaptchaInput(''); clearError('captcha'); };
  const focusFirst = (errs) => {
    const first = FIELD_ORDER.find((f) => errs[f]);
    if (first) document.getElementById(FIELD_IDS[first])?.focus();
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (busy) return;

    const found = compact({
      fullName: validateFullName(values.fullName),
      email: validateEmail(values.email),
      username: validateUsername(values.username),
      role: validateRole(values.role),
      captcha: validateCaptcha(captchaInput, challenge),
    });

    if (Object.keys(found).length) {
      // A wrong CAPTCHA answer is discarded: generate a new challenge and clear the input.
      if (found.captcha && captchaInput.trim()) { setChallenge(generateCaptcha()); setCaptchaInput(''); }
      setErrors(found);
      focusFirst(found);
      return;
    }

    setBusy(true);
    await sleep(600);
    const result = saveUser(values);
    setBusy(false);

    if (!result.ok) {
      const errs = result.field ? { [result.field]: result.error } : { form: result.error };
      setErrors(errs);
      if (result.field) document.getElementById(FIELD_IDS[result.field])?.focus();
      return;
    }
    onRegistered(result.user);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="form">
      <FormField id="rg-fullName" label="Full name" icon={User} placeholder="Enter your full name"
        value={values.fullName} onChange={set('fullName')} error={errors.fullName} autoComplete="name" />
      <FormField id="rg-email" label="Email address" icon={Mail} type="email" placeholder="name@company.com"
        value={values.email} onChange={set('email')} error={errors.email} autoComplete="email" spellCheck="false" />
      <div className="field-row">
        <FormField id="rg-username" label="Username / User ID" icon={AtSign} placeholder="Choose a username"
          value={values.username} onChange={set('username')} error={errors.username} autoComplete="username"
          autoCapitalize="none" spellCheck="false" />
        <FormField id="rg-role" label="Role" as="select" value={values.role} onChange={set('role')} error={errors.role}>
          <option value="">Select your role</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </FormField>
      </div>
      <Captcha challenge={challenge} value={captchaInput}
        onChange={(v) => { setCaptchaInput(v); clearError('captcha'); }} onRefresh={newChallenge} error={errors.captcha} />
      {errors.form && <p className="banner error" role="alert">{errors.form}</p>}
      <button type="submit" className="btn primary" disabled={busy}>
        {busy ? (<><Loader2 className="spin" size={18} aria-hidden="true" />Creating demo account…</>) : 'Create demo account'}
      </button>
    </form>
  );
}
