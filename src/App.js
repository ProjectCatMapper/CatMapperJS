import React, { Suspense, lazy, useEffect } from "react";
import { Navigate, Routes, Route, useLocation } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";

import ProtectedRoute from './components/ProtectedRoute';
import DatabaseRoute from './components/DatabaseRoute';

import ReactGA from 'react-ga4';
import CookieBanner from './components/CookieBanner';
import { isCookieConsentAccepted } from './utils/cookieConsent';
import { DEFAULT_DATABASE } from './utils/database';

const DynamicPropertiesForm = lazy(() => import('./components/EditMetadata'));
const Map1 = lazy(() => import('./routes/Map1'));
const Map2 = lazy(() => import('./routes/Map2'));
const Map3 = lazy(() => import('./routes/Map3'));
const Map4 = lazy(() => import('./routes/Map4'));
const Explore = lazy(() => import('./routes/Explore'));
const Translate = lazy(() => import('./routes/Translate'));
const EditPage = lazy(() => import('./routes/Edit'));
const Catmapper = lazy(() => import('./routes/Catmapper'));
const ExploreNode = lazy(() => import('./routes/ExploreNode'));
const MergePage = lazy(() => import('./routes/Merge'));
const About = lazy(() => import('./routes/About'));
const People = lazy(() => import('./routes/People'));
const News = lazy(() => import('./routes/News'));
const Funding = lazy(() => import('./routes/Funding'));
const Citation = lazy(() => import('./routes/Citation'));
const Terms = lazy(() => import('./routes/Terms'));
const Privacy = lazy(() => import('./routes/Privacy'));
const Contact = lazy(() => import('./routes/Contact'));
const Download = lazy(() => import('./routes/Download'));
const DownloadAll = lazy(() => import('./routes/DownloadAll'));
const ApiGuide = lazy(() => import('./routes/APIGuide'));
const UserGuide = lazy(() => import('./routes/UserGuide'));
const Logins = lazy(() => import('./routes/Logins'));
const ForgotPassword = lazy(() => import('./routes/ForgotPassword'));
const RegisterPage = lazy(() => import('./routes/RegisterPage'));
const AdminPage = lazy(() => import('./routes/Admin'));
const FAQ = lazy(() => import('./routes/FAQ'));
const AppHome = lazy(() => import('./routes/AppHome'));
const LogsViewer = lazy(() => import('./routes/LogsViewer'));
const Profile = lazy(() => import('./routes/Profile'));

const GA_ID = process.env.REACT_APP_GOOGLE_ANALYTICS_ID;

const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    if (isCookieConsentAccepted() && GA_ID) {
      ReactGA.send({ hitType: "pageview", page: location.pathname });
    }
  }, [location]);
};

const RouteFallback = () => (
  <Box
    data-testid="route-loading"
    sx={{
      minHeight: '40vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 1.5,
      color: 'text.secondary',
    }}
  >
    <CircularProgress size={28} />
    <Typography variant="body2">Loading page...</Typography>
  </Box>
);

const App = () => {
  // useEffect(() => {
  //   const handlePopState = () => {
  //     if (/\/sociomap\/SM\d+/.test(window.location.pathname)) {
  //       window.location.reload();
  //     }
  //   };

  //   window.addEventListener('popstate', handlePopState);

  //   return () => {
  //     window.removeEventListener('popstate', handlePopState);
  //   };
  // }, []);
  usePageTracking();

  return (
    <>
      <CookieBanner />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path='/' element={<Catmapper />} />
          <Route path='/forgot-password' element={<Navigate to={`/${DEFAULT_DATABASE}/forgot-password`} replace />} />
          <Route path='/reset-password' element={<Navigate to={`/${DEFAULT_DATABASE}/forgot-password`} replace />} />
          <Route path='/:database' element={<DatabaseRoute><AppHome /></DatabaseRoute>} />
          <Route path='/:database/login' element={<DatabaseRoute><Logins /></DatabaseRoute>} />
          <Route path='/:database/forgot-password' element={<DatabaseRoute><ForgotPassword /></DatabaseRoute>} />
          <Route path='/:database/reset-password' element={<DatabaseRoute><ForgotPassword /></DatabaseRoute>} />
          <Route path="/:database/register" element={<DatabaseRoute><RegisterPage /></DatabaseRoute>} />
          <Route path='/:database/explore' element={<DatabaseRoute><Explore /></DatabaseRoute>} />
          <Route path='/:database/translate' element={<DatabaseRoute><Translate /></DatabaseRoute>} />
          <Route path='/:database/:cmid' element={<DatabaseRoute><ExploreNode /></DatabaseRoute>} />
          <Route path='/:database/:cmid/logs' element={<DatabaseRoute><LogsViewer /></DatabaseRoute>} />
          <Route path='/:database/:cmid/:tabval' element={<DatabaseRoute><ExploreNode /></DatabaseRoute>} />
          <Route path='/:database/merge' element={<DatabaseRoute><MergePage /></DatabaseRoute>} />
          <Route path='/:database/merge/:tab' element={<DatabaseRoute><MergePage /></DatabaseRoute>} />
          <Route path='/help/api-guide' element={<ApiGuide />} />
          <Route path='/help/user-guide' element={<UserGuide />} />
          <Route path='/about' element={<About />} />
          <Route path='/people' element={<People />} />
          <Route path='/news' element={<News />} />
          <Route path='/funding' element={<Funding />} />
          <Route path='/citation' element={<Citation />} />
          <Route path='/terms' element={<Terms />} />
          <Route path='/privacy' element={<Privacy />} />
          <Route path='/download' element={<Download />} />
          <Route path='/download/all' element={<DownloadAll />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/map1' element={<Map1 />} />
          <Route path='/map2' element={<Map2 />} />
          <Route path='/map3' element={<Map3 />} />
          <Route path='/map4' element={<Map4 />} />
          <Route path='/FAQ' element={<FAQ />} />
          <Route path='/:database/edit' element={<DatabaseRoute><ProtectedRoute requiredLevel={1}><EditPage /></ProtectedRoute></DatabaseRoute>} />
          <Route path='/:database/profile' element={<DatabaseRoute><ProtectedRoute requiredLevel={1}><Profile /></ProtectedRoute></DatabaseRoute>} />
          <Route path='/:database/profile/:tab' element={<DatabaseRoute><ProtectedRoute requiredLevel={1}><Profile /></ProtectedRoute></DatabaseRoute>} />
          <Route path='/:database/admin' element={<DatabaseRoute><ProtectedRoute requiredLevel={2}><AdminPage /></ProtectedRoute></DatabaseRoute>} />
          <Route path='/admin/metadata' element={<ProtectedRoute requiredLevel={2}><DynamicPropertiesForm /></ProtectedRoute>} />
          <Route path='/admin/metadata/:database/:cmid/view' element={<ProtectedRoute requiredLevel={2}><DynamicPropertiesForm /></ProtectedRoute>} />
          <Route path='/admin/metadata/:database/:cmid/edit' element={<ProtectedRoute requiredLevel={2}><DynamicPropertiesForm /></ProtectedRoute>} />
          <Route path='/editMetadata/:legacyCmid' element={<ProtectedRoute requiredLevel={2}><DynamicPropertiesForm /></ProtectedRoute>} />
        </Routes >
      </Suspense>
    </>
  );
}

export default App;
