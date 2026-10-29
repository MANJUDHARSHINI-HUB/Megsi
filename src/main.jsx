import React from 'react';
import { createRoot } from 'react-dom/client';
import AuthGate from './auth/AuthGate.jsx';
import { I18nProvider } from './i18n/I18nContext.jsx';
import './styles/global.css';
createRoot(document.getElementById('root')).render(<I18nProvider><AuthGate /></I18nProvider>);
