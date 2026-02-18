import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import ProtectedRoute from './components/ProtectedRoute';
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
import People from './routes/People';
import News from './routes/News';
import Funding from './routes/Funding';
import Citation from './routes/Citation';
import Terms from './routes/Terms';
import Contact from './routes/Contact';
import Download from './routes/Download';
import DownloadAll from './routes/DownloadAll';
import ApiGuide from './routes/APIGuide';
import UserGuide from './routes/UserGuide';
import Logins from './routes/Logins';
import RegisterPage from './routes/RegisterPage';
import AdminPage from './routes/Admin';
import FAQ from './routes/FAQ';
import AppHome from './routes/AppHome';
import LogsViewer from './routes/LogsViewer';
import Profile from './routes/Profile';

import ReactGA from 'react-ga4';
import CookieBanner from './components/CookieBanner';

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
    <>
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
        <Route path='/:database/profile' element={<ProtectedRoute requiredLevel={1}><Profile /></ProtectedRoute>} />
        <Route path='/:database/profile/:tab' element={<ProtectedRoute requiredLevel={1}><Profile /></ProtectedRoute>} />
        <Route path='/:database/admin' element={<ProtectedRoute requiredLevel={2}><AdminPage /></ProtectedRoute>} />
        <Route path='/editMetadata/:cmid' element={<ProtectedRoute requiredLevel={2}><DynamicPropertiesForm /></ProtectedRoute>} />
      </Routes >
    </>
  );
}

export default App;
