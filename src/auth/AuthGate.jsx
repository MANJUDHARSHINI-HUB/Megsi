
import { useState } from 'react';
import AuthFlow from './AuthFlow.jsx';
import { resolveDestination } from './roleRoutes.js';
import App from '../App.jsx';

export default function AuthGate() {
  const [session, setSession] = useState(null);

  const signOut = () => setSession(null);

  if (session) {
    const destination = resolveDestination(session.user.role);

    if (destination === 'platform-console') {
      return (
        <App
          userRole={session.user.role}
          onSignOut={signOut}
        />
      );
    }
  }

  return (
    <AuthFlow
      onAuthenticated={(user) => {
        const destination = resolveDestination(user.role);

        if (!destination) return false;

        setSession({
          user: {
            username: user.username,
            email: user.email,
            role: user.role,
          },
          destination,
        });

        return true;
      }}
    />
  );
}
