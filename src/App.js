import { React, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Map1 from './routes/Map1';
import Map2 from './routes/Map2';
import Map3 from './routes/Map3';
import Map4 from './routes/Map4';
import Explore from './routes/Explore'
import Translate from './routes/Translate'
import BulkEdit from './routes/BulkEdit'
import Catmapper from "./routes/Catmapper";
import ExploreNode from "./routes/ExploreNode";
import Merge from "./routes/Merge";
import People from "./routes/People"
import News from "./routes/News"
import Funding from "./routes/Funding"
import Citation from "./routes/Citation"
import Terms from "./routes/Terms"
import Contact from "./routes/Contact"
import Download from "./routes/Download"
import DownloadAll from "./routes/DownloadAll"
import ApiGuide from "./routes/APIGuide"
import UserGuide from "./routes/UserGuide"
import Logins from "./routes/Logins";
import RegisterPage from './routes/RegisterPage';
import AdminPage from './routes/Admin';
import ProtectedRoute from './components/ProtectedRoute';
import FAQ from "./routes/FAQ";
import AppHome from './routes/HomeApp';

function App() {
  useEffect(() => {
    const handlePopState = () => {
      if (/\/sociomap\/SM\d+/.test(window.location.pathname)) {
        window.location.reload();
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  let SociomapRoute = AppHome('sociomap')
  let ArchamapRoute = AppHome('archamap')
  return (
    <Routes>
      <Route path='/' element={<Catmapper />} />
      <Route path='/sociomap' element={<SociomapRoute.element />} />
      <Route path='/archamap' element={<ArchamapRoute.element />} />
      <Route path='/login' element={<Logins />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path='/sociomap/explore' element={<Explore />} />
      <Route path='/archamap/explore' element={<Explore />} />
      <Route path='/sociomap/translate' element={<Translate />} />
      <Route path='/archamap/translate' element={<Translate />} />
      <Route path='/sociomap/:cmid' element={<ExploreNode />} />
      <Route path='/archamap/:cmid' element={<ExploreNode />} />
      <Route path='/sociomap/:cmid/:tabval' element={<ExploreNode />} />
      <Route path='/archamap/:cmid/:tabval' element={<ExploreNode />} />
      <Route path='/sociomap/merge' element={<Merge />} />
      <Route path='/archamap/merge' element={<Merge />} />
      <Route path='/sociomap/help/api-guide' element={<ApiGuide />} />
      <Route path='/sociomap/help/user-guide' element={<UserGuide />} />
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
      <Route path="sociomap/edit" element={<ProtectedRoute requiredLevel={1}><BulkEdit /></ProtectedRoute>} />
      <Route path="archamap/edit" element={<ProtectedRoute requiredLevel={1}><BulkEdit /></ProtectedRoute>} />
      <Route path="/sociomap/admin" element={<ProtectedRoute requiredLevel={2}><AdminPage /></ProtectedRoute>} />
      <Route path="/archamap/admin" element={<ProtectedRoute requiredLevel={2}><AdminPage /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;