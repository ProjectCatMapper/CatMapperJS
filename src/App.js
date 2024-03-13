import React from "react";
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

function App() {
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
      </Routes>
  );
}

export default App;