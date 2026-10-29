# MEG-SI: Authentication demo + Platform Admin dashboard

Entry point is now the sign-in / register / CAPTCHA / email-OTP flow. After a verified OTP, a role that has an
existing destination opens the existing, unchanged Platform Admin console. Everything is front-end only (no backend).

## Run (Windows, PowerShell or cmd, Node 18+)
```
cd megsi-dashboard
npm install
npm run dev          # open the printed URL (usually http://localhost:5173)
npm run build        # production build check
```
No dependency was added or changed (`package.json` and `package-lock.json` are byte-identical to your original).
If PowerShell blocks `npm`, run `Set-ExecutionPolicy -Scope Process Bypass` once in that window, or use cmd.
Try it: Register -> role "Super Admin" -> Create account -> Sign in -> use the DEMO ONLY code -> dashboard.
Sign out: profile menu (top right) -> "Sign Out".

## How the two projects work
* Dashboard (`megsi-admin`): Vite + React 18, `lucide-react`, `recharts`. One interface, the MEGSI Platform Admin console
  (identity in header: "Platform Super Admin"). No router: `App.jsx` holds `page` in React state and the sidebar calls `go(id)`.
  22 pages, default `dashboard`. Page scrolling is document-level. No auth, no role switching.
* Auth demo: Vite + React 18, same `lucide-react`. Views: signin / register / registered / otp. Users saved in
  `localStorage['megsi-auth-demo:registrations:v1']` (name, email, username, role, time: no passwords, no OTP).

## Flow
```
index.html -> main.jsx -> I18nProvider -> AuthGate
AuthGate (session in React memory = null)
  -> AuthFlow: Register (validation + CAPTCHA) -> saved in this browser
              Sign in (username + matching email) -> generateOtp() -> OTP screen
              OTP ok -> onAuthenticated(user)
  -> AuthGate: resolveDestination(user.role)   [src/auth/roleRoutes.js]
        'Super Admin' -> 'platform-console' -> <App onSignOut/> (default page 'dashboard')
        any other role -> AuthFlow shows "No dashboard is available for the <role> role" + Sign out
Sign Out (existing header profile menu) -> AuthGate session = null -> App unmounts -> sign-in page (blank form)
```

## Role mapping (verified in source)
| Role string (registration dropdown) | Existing destination | Mechanism | Exists? |
|---|---|---|---|
| `Super Admin` | Platform Admin console, page `dashboard` | `AuthGate` renders `<App/>` | Yes |
| `Customer Admin` | none | the sidebar item "Customer Admins" (`cadmins`) is a page *for platform admins to manage customer admins*, not a customer-admin interface | **No** |
| `Tenant Admin`, `Support Agent`, `Auditor`, `Analyst`, `Manager`, `Admin` | none | the console has no per-role views; Roles & Permissions is a localStorage demo that gates nothing | **No** |

Only `Super Admin` is mapped. Mapping Customer Admin to the platform console would show one tenant's admin every company,
all billing and all users, so it was deliberately not done. To add a role later, add one line to `ROLE_DESTINATIONS`
in `src/auth/roleRoutes.js` once its interface exists.

## CAPTCHA and OTP (what they really are)
* CAPTCHA: 6 random characters generated and compared in the browser. Illustration only; **no bot protection**.
* OTP: 6 random digits in React memory, **displayed on screen** (DEMO ONLY panel). 5-minute expiry, 5 attempts then locked,
  30 s resend cool-down, resend invalidates the old code. No email is sent. **Not production security.**
* Role is a self-selected dropdown stored in the browser; editing localStorage can change it (tested; see below).
  **Not authorization.** Session is memory-only: reload = signed out. Nothing secret goes to localStorage/sessionStorage.

## Files
Modified (3):
* `src/main.jsx`: render `AuthGate` instead of `App` (entry point).
* `src/App.jsx`: accept optional `onSignOut` prop and pass it to `Header` (2 lines; BOM + CRLF preserved).
* `src/components/Header.jsx`: existing "Sign Out" menu item calls `onSignOut` when provided (previously a demo toast).
Added: `src/auth/` (`AuthGate.jsx`, `AuthFlow.jsx` [demo App.jsx adapted], `roleRoutes.js`, `components/*`, `utils/*`,
`assets/logo.png`, `styles/auth.css` [every selector prefixed `.auth-app`; global `body{margin:0}` removed]),
and `integration-notes/` (this file + `e2e.py`). Deleted: none.
Why the CSS was scoped: the demo's stylesheet claimed to be scoped but ~100 selectors were global and 5 class names
(`.brand-logo .brand-sub .brand-badge .icon-btn .success`) collide with the dashboard's sidebar/topbar. Vite bundles all CSS
globally, so they would have restyled the dashboard.
Small edits inside the demo: `SuccessView` variant `loggedIn` ("does not open the dashboard") replaced by `noDashboard`.

## Backend still required for real security
`POST /auth/register` (+ email verification link), `POST /auth/login` (credentials or passwordless; rate-limited),
server-generated OTP (hashed, 5 min expiry, attempt limit, single use) sent through an email provider to the *verified*
address, `POST /auth/verify-otp` -> sets an HttpOnly, Secure, SameSite session cookie, `GET /auth/session` (returns
user + server-assigned role), `POST /auth/logout` (invalidate server session), server-side CAPTCHA verification
(reCAPTCHA/hCaptcha/Turnstile secret key) and server-enforced role/permission checks on every API the dashboard calls.
Roles must be assigned by an admin, not chosen at registration. Then `AuthGate` reads the session from `/auth/session`
instead of React state. Not configured here: email service, API keys, env vars, database.

## Tests run (Chromium via Playwright, `integration-notes/e2e.py`, 50 checks, 50 passed)
Not run: real email delivery (none exists), a real backend, mobile/Safari/Firefox, Windows. Tested on Linux with a fresh `npm ci`.
