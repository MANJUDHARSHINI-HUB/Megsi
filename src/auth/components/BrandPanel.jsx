import { ShieldCheck, KeyRound, ClipboardList } from 'lucide-react';
import logo from '../assets/logo.png';

const POINTS = [
  { icon: KeyRound, title: 'Role-based access', text: 'Eight platform roles keep every user inside their own scope.' },
  { icon: ShieldCheck, title: 'Verified sign-in', text: 'A one-time code confirms each session before access is granted.' },
  { icon: ClipboardList, title: 'Audit-ready activity', text: 'Sign-in events are built to support compliance reviews.' },
];

export default function BrandPanel() {
  return (
    <aside className="brand-panel">
      <svg className="brand-motif" viewBox="0 0 400 460" aria-hidden="true">
        <path d="M200 20 L360 80 V220 C360 320 290 390 200 440 C110 390 40 320 40 220 V80 Z" />
        <path d="M200 70 L322 116 V220 C322 296 270 350 200 390 C130 350 78 296 78 220 V116 Z" />
        <path d="M140 226 L184 270 L264 176" />
      </svg>

      <header className="brand-top">
        <img className="brand-logo" src={logo} alt="MEG-SI" />
        <div className="brand-lines">
          <span className="brand-sub">SECURITY WORKFORCE MANAGEMENT</span>
          <span className="brand-badge">PLATFORM ADMIN</span>
        </div>
      </header>

      <div className="brand-body">
        <p className="brand-headline">Security workforce management, protected at every sign-in.</p>
        <p className="brand-copy">
          Coordinate guards, sites and shifts from one platform built for security operations teams.
        </p>
        <ul className="brand-points">
          {POINTS.map(({ icon: Icon, title, text }) => (
            <li key={title}>
              <span className="brand-point-icon"><Icon size={20} aria-hidden="true" /></span>
              <span>
                <b>{title}</b>
                <small>{text}</small>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <footer className="brand-foot">© 2026 MEG-SI. Demonstration environment.</footer>
    </aside>
  );
}
