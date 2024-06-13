import {React, useEffect} from "react";
import {Routes, Route} from "react-router-dom";

import Home from './routes/Home'
import Explore from './routes/Explore'
import Translate from './routes/Translate'
import Catmapper from "./routes/Catmapper";
import Archamap from "./routes/Archamap"
import Profile from "./routes/Profile";
import Sociomapclick from "./routes/Sociomapclick";
import ArchaMapclick from "./routes/ArchaMapclick";
import Archamapexplore from "./routes/Archamapexplore";
import Merge from "./routes/Merge";
import People from "./routes/People"
import News from "./routes/News"
import Funding from "./routes/Funding"
import Citation from "./routes/Citation"
import Terms from "./routes/Terms"
import Contact from "./routes/Contact"
import Sociomap_ApiGuide from "./routes/Sociomap_ApiGuide"

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
        <Route path='/archamap' element={<Archamap />} />
        <Route path='/sociomap' element={<Home />} />
        <Route path='/sociomap/explore' element={<Explore />} />
        <Route path='/archamap/explore' element={<Archamapexplore />} />
        <Route path='/sociomap/translate' element={<Translate />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/sociomap/:cmid' element={<Sociomapclick />} />
        <Route path='/archamap/:cmid' element={<ArchaMapclick />} />
        <Route path='/sociomap/:cmid/:tabval' element={<Sociomapclick />} />
        <Route path='/archamap/:cmid/:tabval' element={<ArchaMapclick />} />
        <Route path='/sociomap/merge' element={<Merge />} />
        <Route path='/sociomap/help/api-guide' element={<Sociomap_ApiGuide />} />
        <Route path='/people' element={<People />} />
        <Route path='/news' element={<News />} />
        <Route path='/funding' element={<Funding />} />
        <Route path='/citation' element={<Citation />} />
        <Route path='/terms' element={<Terms />} />
        <Route path='/contact' element={<Contact />} />
      </Routes>
  );
}

export default App;