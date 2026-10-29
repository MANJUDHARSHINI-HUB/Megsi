import { CheckCircle2, LogOut, LogIn } from 'lucide-react';

// variant "registered": demo registration finished.
// variant "noDashboard": OTP verified, but no existing dashboard is mapped to this role (see ../roleRoutes.js).
export default function SuccessView({ variant, user, onAction }) {
  const noDashboard = variant === 'noDashboard';
  const rows = noDashboard
    ? [['Username', user.username], ['Email', user.email], ['Role', user.role]]
    : [['Username', user.username], ['Email', user.email], ['Selected role', user.role]];

  return (
    <div className="success">
      <span className="success-icon"><CheckCircle2 size={34} aria-hidden="true" /></span>
      <h1 id="auth-heading" tabIndex={-1}>
        {noDashboard ? `No dashboard is available for the ${user.role} role` : 'Registration completed successfully.'}
      </h1>
      <p className="lead">
        {noDashboard
          ? 'Your demo email OTP was verified, but the MEG-SI dashboard has no interface for this role yet. Only the Super Admin role opens the existing Platform Admin console.'
          : 'Your demo account was saved in this browser only. No server account was created.'}
      </p>
      <dl className="summary">
        {rows.map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}
      </dl>
      <button type="button" className="btn primary" onClick={onAction}>
        {noDashboard ? (<><LogOut size={18} aria-hidden="true" />Sign out</>) : (<><LogIn size={18} aria-hidden="true" />Go to sign in</>)}
      </button>
    </div>
  );
}
