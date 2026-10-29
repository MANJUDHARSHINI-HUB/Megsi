import { useState } from 'react';
import { User, Mail, Loader2 } from 'lucide-react';
import FormField from './FormField.jsx';
import { validateEmail, validateUsername, compact } from '../utils/validation.js';
import { findUser, sleep } from '../utils/demoAuth.js';

export default function SignInForm({ initialValues, onContinue }) {
  const [values, setValues] = useState({ username: initialValues?.username || '', email: initialValues?.email || '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const set = (field) => (e) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    if (errors[field]) setErrors((er) => ({ ...er, [field]: '' })); // clear the error as the user corrects it
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (busy) return;

    const found = compact({ username: validateUsername(values.username), email: validateEmail(values.email) });
    if (Object.keys(found).length) {
      setErrors(found);
      document.getElementById(found.username ? 'si-username' : 'si-email')?.focus();
      return;
    }

    setBusy(true);
    await sleep(500);
    const result = findUser(values.username, values.email);
    setBusy(false);

    if (result.status === 'not_found') {
      setErrors({ username: 'No demo account found for this username. Register one in this browser first.' });
      document.getElementById('si-username')?.focus();
    } else if (result.status === 'email_mismatch') {
      setErrors({ email: 'This email does not match the one registered for this username.' });
      document.getElementById('si-email')?.focus();
    } else {
      setErrors({});
      onContinue(result.user);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="form">
      <FormField
        id="si-username"
        label="Username / User ID"
        icon={User}
        placeholder="Enter your username"
        value={values.username}
        onChange={set('username')}
        error={errors.username}
        autoComplete="username"
        autoCapitalize="none"
        spellCheck="false"
      />
      <FormField
        id="si-email"
        label="Email address"
        icon={Mail}
        type="email"
        placeholder="name@company.com"
        value={values.email}
        onChange={set('email')}
        error={errors.email}
        autoComplete="email"
        spellCheck="false"
      />
      <button type="submit" className="btn primary" disabled={busy}>
        {busy ? (<><Loader2 className="spin" size={18} aria-hidden="true" />Checking details…</>) : 'Continue with email OTP'}
      </button>
    </form>
  );
}
