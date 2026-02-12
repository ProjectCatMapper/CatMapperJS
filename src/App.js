import React, { useEffect, Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import ProtectedRoute from './components/ProtectedRoute';
import DynamicPropertiesForm from './components/EditMetadata';

import ReactGA from 'react-ga4';
import CookieBanner from './components/CookieBanner';

const lazyWithRetry = (importer, key) =>
  lazy(async () => {
    const storageKey = `lazy-retry-${key}`;
    const hasRefreshed = sessionStorage.getItem(storageKey) === 'true';

    try {
      const module = await importer();
      sessionStorage.setItem(storageKey, 'false');
      return module;
    } catch (error) {
      const isChunkError =
        error?.name === 'ChunkLoadError' ||
        /Loading chunk [\\w-]+ failed/i.test(error?.message || '');

      if (isChunkError && !hasRefreshed) {
        sessionStorage.setItem(storageKey, 'true');
        window.location.reload();
      }

      throw error;
    }
  });

// Lazy load all page components
const Map1 = lazyWithRetry(() => import('./routes/Map1'), 'Map1');
const Map2 = lazyWithRetry(() => import('./routes/Map2'), 'Map2');
const Map3 = lazyWithRetry(() => import('./routes/Map3'), 'Map3');
const Map4 = lazyWithRetry(() => import('./routes/Map4'), 'Map4');
const Explore = lazyWithRetry(() => import('./routes/Explore'), 'Explore');
const Translate = lazyWithRetry(() => import('./routes/Translate'), 'Translate');
const EditPage = lazyWithRetry(() => import('./routes/Edit'), 'EditPage');
const Catmapper = lazyWithRetry(() => import('./routes/Catmapper'), 'Catmapper');
const ExploreNode = lazyWithRetry(() => import('./routes/ExploreNode'), 'ExploreNode');
const MergePage = lazyWithRetry(() => import('./routes/Merge'), 'MergePage');
const People = lazyWithRetry(() => import('./routes/People'), 'People');
const News = lazyWithRetry(() => import('./routes/News'), 'News');
const Funding = lazyWithRetry(() => import('./routes/Funding'), 'Funding');
const Citation = lazyWithRetry(() => import('./routes/Citation'), 'Citation');
const Terms = lazyWithRetry(() => import('./routes/Terms'), 'Terms');
const Contact = lazyWithRetry(() => import('./routes/Contact'), 'Contact');
const Download = lazyWithRetry(() => import('./routes/Download'), 'Download');
const DownloadAll = lazyWithRetry(() => import('./routes/DownloadAll'), 'DownloadAll');
const ApiGuide = lazyWithRetry(() => import('./routes/APIGuide'), 'ApiGuide');
const UserGuide = lazyWithRetry(() => import('./routes/UserGuide'), 'UserGuide');
const Logins = lazyWithRetry(() => import('./routes/Logins'), 'Logins');
const RegisterPage = lazyWithRetry(() => import('./routes/RegisterPage'), 'RegisterPage');
const AdminPage = lazyWithRetry(() => import('./routes/Admin'), 'AdminPage');
const FAQ = lazyWithRetry(() => import('./routes/FAQ'), 'FAQ');
const AppHome = lazyWithRetry(() => import('./routes/AppHome'), 'AppHome');
const LogsViewer = lazyWithRetry(() => import('./routes/LogsViewer'), 'LogsViewer');

const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (consent === 'true') {
      ReactGA.send({ hitType: "pageview", page: location.pathname });
    }
  }, [location]);
};


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
    <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>}>
      <CookieBanner />
      <Routes>
        <Route path='/' element={<Catmapper />} />
        <Route path='/:database' element={<AppHome />} />
        <Route path='/:database/login' element={<Logins />} />
        <Route path="/:database/register" element={<RegisterPage />} />
        <Route path='/:database/explore' element={<Explore />} />
        <Route path='/:database/translate' element={<Translate />} />
        <Route path='/:database/:cmid' element={<ExploreNode />} />
        <Route path='/:database/:cmid/logs' element={<LogsViewer />} />
        <Route path='/:database/:cmid/:tabval' element={<ExploreNode />} />
        <Route path='/:database/merge' element={<MergePage />} />
        <Route path='/help/api-guide' element={<ApiGuide />} />
        <Route path='/help/user-guide' element={<UserGuide />} />
        <Route path='/people' element={<People />} />
        <Route path='/news' element={<News />} />
        <Route path='/funding' element={<Funding />} />
        <Route path='/citation' element={<Citation />} />
        <Route path='/terms' element={<Terms />} />
        <Route path='/download' element={<Download />} />
        <Route path='/download/all' element={<DownloadAll />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/map1' element={<Map1 />} />
        <Route path='/map2' element={<Map2 />} />
        <Route path='/map3' element={<Map3 />} />
        <Route path='/map4' element={<Map4 />} />
        <Route path='/FAQ' element={<FAQ />} />
        <Route path='/:database/edit' element={<ProtectedRoute requiredLevel={1}><EditPage /></ProtectedRoute>} />
        <Route path='/:database/admin' element={<ProtectedRoute requiredLevel={2}><AdminPage /></ProtectedRoute>} />
        <Route path='/editMetadata/:cmid' element={<ProtectedRoute requiredLevel={2}><DynamicPropertiesForm /></ProtectedRoute>} />

      </Routes >
    </Suspense >
  );
}

export default App;
