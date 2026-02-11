import React, { useEffect, Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";

import ProtectedRoute from './components/ProtectedRoute';
import DynamicPropertiesForm from './components/EditMetadata';

// Lazy load all page components
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
const People = lazy(() => import('./routes/People'));
const News = lazy(() => import('./routes/News'));
const Funding = lazy(() => import('./routes/Funding'));
const Citation = lazy(() => import('./routes/Citation'));
const Terms = lazy(() => import('./routes/Terms'));
const Contact = lazy(() => import('./routes/Contact'));
const Download = lazy(() => import('./routes/Download'));
const DownloadAll = lazy(() => import('./routes/DownloadAll'));
const ApiGuide = lazy(() => import('./routes/APIGuide'));
const UserGuide = lazy(() => import('./routes/UserGuide'));
const Logins = lazy(() => import('./routes/Logins'));
const RegisterPage = lazy(() => import('./routes/RegisterPage'));
const AdminPage = lazy(() => import('./routes/Admin'));
const FAQ = lazy(() => import('./routes/FAQ'));
const AppHome = lazy(() => import('./routes/AppHome'));
const LogsViewer = lazy(() => import('./routes/LogsViewer'));



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

  return (
    <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>}>
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