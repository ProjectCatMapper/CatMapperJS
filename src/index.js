import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import ReactGA from 'react-ga4';

const GA_ID = process.env.REACT_APP_GOOGLE_ANALYTICS_ID;

// 1. Define a function to handle initialization logic
const initAnalytics = () => {
  const consent = localStorage.getItem('cookie-consent');

  if (consent === 'true') {
    if (!GA_ID) {
      console.warn('Google Analytics is enabled by consent, but REACT_APP_GOOGLE_ANALYTICS_ID is not set.');
      return;
    }

    // User accepted: initialize and track page view.
    ReactGA.initialize(GA_ID);
    ReactGA.send({ hitType: "pageview", page: window.location.pathname + window.location.search });
  } else {
    // User declined or hasn't decided: Disable tracking
    if (GA_ID) {
      window[`ga-disable-${GA_ID}`] = true;
    }
  }
};

// 2. Run the check on load
initAnalytics();

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <AuthProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </AuthProvider>
);
