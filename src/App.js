import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import ProtectedRoute from './components/ProtectedRoute';
import DatabaseRoute from './components/DatabaseRoute';
import DynamicPropertiesForm from './components/EditMetadata';
import Map1 from './routes/Map1';
import Map2 from './routes/Map2';
import Map3 from './routes/Map3';
import Map4 from './routes/Map4';
import Explore from './routes/Explore';
import Translate from './routes/Translate';
import EditPage from './routes/Edit';
import Catmapper from './routes/Catmapper';
import ExploreNode from './routes/ExploreNode';
import MergePage from './routes/Merge';
import About from './routes/About';
import People from './routes/People';
import News from './routes/News';
import Funding from './routes/Funding';
import Citation from './routes/Citation';
import Terms from './routes/Terms';
import Privacy from './routes/Privacy';
import Contact from './routes/Contact';
import Download from './routes/Download';
import DownloadAll from './routes/DownloadAll';
import ApiGuide from './routes/APIGuide';
import UserGuide from './routes/UserGuide';
import Logins from './routes/Logins';
import ForgotPassword from './routes/ForgotPassword';
import RegisterPage from './routes/RegisterPage';
import AdminPage from './routes/Admin';
import FAQ from './routes/FAQ';
import AppHome from './routes/AppHome';
import LogsViewer from './routes/LogsViewer';
import Profile from './routes/Profile';

import ReactGA from 'react-ga4';
import CookieBanner from './components/CookieBanner';

const GA_ID = process.env.REACT_APP_GOOGLE_ANALYTICS_ID;

const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (consent === 'true' && GA_ID) {
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
    <>
      <CookieBanner />
      <Routes>
        <Route path='/' element={<Catmapper />} />
        <Route path='/:database' element={<DatabaseRoute><AppHome /></DatabaseRoute>} />
        <Route path='/:database/login' element={<DatabaseRoute><Logins /></DatabaseRoute>} />
        <Route path='/:database/forgot-password' element={<DatabaseRoute><ForgotPassword /></DatabaseRoute>} />
        <Route path="/:database/register" element={<DatabaseRoute><RegisterPage /></DatabaseRoute>} />
        <Route path='/:database/explore' element={<DatabaseRoute><Explore /></DatabaseRoute>} />
        <Route path='/:database/translate' element={<DatabaseRoute><Translate /></DatabaseRoute>} />
        <Route path='/:database/:cmid' element={<DatabaseRoute><ExploreNode /></DatabaseRoute>} />
        <Route path='/:database/:cmid/logs' element={<DatabaseRoute><LogsViewer /></DatabaseRoute>} />
        <Route path='/:database/:cmid/:tabval' element={<DatabaseRoute><ExploreNode /></DatabaseRoute>} />
        <Route path='/:database/merge' element={<DatabaseRoute><MergePage /></DatabaseRoute>} />
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
    </>
  );
}

export default App;
