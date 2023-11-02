import React from "react";
import {Routes, Route} from "react-router-dom";

import Home from './routes/Home'
import Explore from './routes/Explore'
import Catmapper from "./routes/Catmapper";
import Archamap from "./routes/Archamap"
import Profile from "./routes/Profile";
import Sociomapclick from "./routes/Sociomapclick";


function App() {
  return (
      <Routes>
        <Route path='/' element={<Catmapper />} />
        <Route path='/Archamap' element={<Archamap />} />
        <Route path='/Home' element={<Home />} />
        <Route path='/explore' element={<Explore />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/exview/:socioid' element={<Sociomapclick />} />
      </Routes>
  );
}

export default App;
