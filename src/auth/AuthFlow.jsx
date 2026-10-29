import { useEffect, useRef, useState } from 'react';
import { LogIn, UserPlus, Info } from 'lucide-react';
import BrandPanel from './components/BrandPanel.jsx';
import SignInForm from './components/SignInForm.jsx';
import RegisterForm from './components/RegisterForm.jsx';
import OtpVerification from './components/OtpVerification.jsx';
import SuccessView from './components/SuccessView.jsx';
import { generateOtp } from './utils/demoAuth.js';
import './styles/auth.css'; // every selector in this file is scoped under .auth-app

// views: 'signin' | 'register' | 'registered' | 'otp' | 'noDashboard'
// After a verified OTP, `onAuthenticated(user)` decides where the user goes (see ./AuthGate.jsx).
// It returns false when the role has no existing dashboard, and the 'noDashboard' view is shown.
const HEADINGS = {
  signin: ['Sign in to MEG-SI', 'Enter your username and email to receive a one-time code.'],
  register: ['Create your account', 'Register a demo user to try the sign-in flow.'],
  otp: ['Verify your email', null],
};

export default function AuthFlow({ onAuthenticated }) {
  const [view, setView] = useState('signin');
  const [user, setUser] = useState(null); // the registered demo user being signed in
  const [otp, setOtp] = useState(null); // { code, issuedAt, expiresAt }, kept in memory only
  const [prefill, setPrefill] = useState(null);
  const cardRef = useRef(null);
  const first = useRef(true);

  // Move focus to the new view's heading so keyboard and screen-reader users know something changed.
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (view !== 'otp') cardRef.current?.querySelector('#auth-heading')?.focus();
  }, [view]);

  const showTabs = view === 'signin' || view === 'register';
  const heading = HEADINGS[view];

  const goSignIn = (values = null) => { setPrefill(values); setUser(null); setOtp(null); setView('signin'); };

  return (
    <div className="auth-app">
      <div className="auth-shell">
        <BrandPanel />
        <main className="auth-main">
          <section className="auth-card" ref={cardRef}>
            {showTabs && (
              <div className="tabs" role="tablist" aria-label="Authentication">
                <button type="button" role="tab" id="tab-signin" aria-selected={view === 'signin'} aria-controls="auth-panel"
                  className="tab" onClick={() => setView('signin')}><LogIn size={17} aria-hidden="true" />Sign In</button>
                <button type="button" role="tab" id="tab-register" aria-selected={view === 'register'} aria-controls="auth-panel"
                  className="tab" onClick={() => setView('register')}><UserPlus size={17} aria-hidden="true" />Register</button>
              </div>
            )}

            <div id="auth-panel" className="view" key={view} role={showTabs ? 'tabpanel' : undefined} aria-labelledby={showTabs ? `tab-${view}` : undefined}>
              {heading && (
                <header className="card-head">
                  <h1 id="auth-heading" tabIndex={-1}>{heading[0]}</h1>
                  {heading[1] && <p>{heading[1]}</p>}
                </header>
              )}

              {view === 'signin' && (
                <SignInForm initialValues={prefill} onContinue={(u) => { setUser(u); setOtp(generateOtp()); setView('otp'); }} />
              )}
              {view === 'register' && (
                <RegisterForm onRegistered={(u) => { setUser(u); setView('registered'); }} />
              )}
              {view === 'otp' && user && otp && (
                <OtpVerification user={user} otp={otp} onResend={() => setOtp(generateOtp())}
                  onVerified={() => { setOtp(null); if (!onAuthenticated(user)) setView('noDashboard'); }} onBack={() => goSignIn({ username: user.username, email: user.email })} />
              )}
              {view === 'registered' && user && (
                <SuccessView variant="registered" user={user} onAction={() => goSignIn({ username: user.username, email: user.email })} />
              )}
              {view === 'noDashboard' && user && (
                <SuccessView variant="noDashboard" user={user} onAction={() => goSignIn()} />
              )}
            </div>

            <p className="card-foot">
              <Info size={16} aria-hidden="true" />
              <span>Demo environment: registration and OTP are simulated in your browser. No email is sent and no server account is created.</span>
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
