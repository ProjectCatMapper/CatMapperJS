import {React, useEffect} from "react";
import {Routes, Route} from "react-router-dom";
import Map1 from './routes/Map1';
import Map2 from './routes/Map2';
import Map3 from './routes/Map3';
import Map4 from './routes/Map4';

import Home from './routes/Home'
import Explore from './routes/Explore'
import Translate from './routes/Translate'
import Archamap_Translate from './routes/Archamap_Translate'
import UploadTranslate from './routes/UploadTranslate'
import Archamap_UploadTranslate from './routes/Archamap_UploadTranslate'
import Catmapper from "./routes/Catmapper";
import Archamap from "./routes/Archamap"
import Sociomapclick from "./routes/Sociomapclick";
import ArchaMapclick from "./routes/ArchaMapclick";
import Archamapexplore from "./routes/Archamapexplore";
import Merge from "./routes/Merge";
import Archamap_Merge from "./routes/Archamap_Merge";
import People from "./routes/People"
import News from "./routes/News"
import Funding from "./routes/Funding"
import Citation from "./routes/Citation"
import Terms from "./routes/Terms"
import Contact from "./routes/Contact"
import Sociomap_ApiGuide from "./routes/Sociomap_ApiGuide"
import Logins from "./routes/Logins";
import RegisterPage from './routes/RegisterPage';
// import AdvancedPage from './routes/Advanced';
import AdminPage from './routes/Admin';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  useEffect(() => {
    const handlePopState = () => {
      if (/\/js\/sociomap\/SM\d+/.test(window.location.pathname)) {
        window.location.reload();
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);


  return (
      <Routes>
        <Route path='/' element={<Catmapper />} />
        <Route path='/login' element={<Logins />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path='/archamap' element={<Archamap />} />
        <Route path='/sociomap' element={<Home />} />
        <Route path='/sociomap/explore' element={<Explore />} />
        <Route path='/archamap/explore' element={<Archamapexplore />} />
        <Route path='/sociomap/translate' element={<Translate />} />
        <Route path='/archamap/translate' element={<Archamap_Translate />} />
        <Route path='/sociomap/:cmid' element={<Sociomapclick />} />
        <Route path='/archamap/:cmid' element={<ArchaMapclick />} />
        <Route path='/sociomap/:cmid/:tabval' element={<Sociomapclick />} />
        <Route path='/archamap/:cmid/:tabval' element={<ArchaMapclick />} />
        <Route path='/sociomap/merge' element={<Merge />} />
        <Route path='/archamap/merge' element={<Archamap_Merge />} />
        <Route path='/sociomap/help/api-guide' element={<Sociomap_ApiGuide />} />
        <Route path='/people' element={<People />} />
        <Route path='/news' element={<News />} />
        <Route path='/funding' element={<Funding />} />
        <Route path='/citation' element={<Citation />} />
        <Route path='/terms' element={<Terms />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/map1' element={<Map1 />} />
        <Route path='/map2' element={<Map2 />} />
        <Route path='/map3' element={<Map3 />} />
        <Route path='/map4' element={<Map4 />} />
        {/* <Route path="/advanced" element={<ProtectedRoute requiredLevel={1}><AdvancedPage /></ProtectedRoute>}/> */}
        <Route path="sociomap/uploadtranslate" element={<ProtectedRoute requiredLevel={1}><UploadTranslate /></ProtectedRoute>}/>
        <Route path="archamap/uploadtranslate" element={<ProtectedRoute requiredLevel={1}><Archamap_UploadTranslate /></ProtectedRoute>}/>
        <Route path="/admin" element={<ProtectedRoute requiredLevel={2}><AdminPage /></ProtectedRoute>}/>
      </Routes>
  );
}

export default App;