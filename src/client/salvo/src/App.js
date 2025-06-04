
import React, { useState } from 'react';
import './App.css';
import { GameInfo, CreateGrid } from './components/game.jsx'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { CreateGridSalvo } from './components/createGridSalvo.jsx';

function App() {
  const [playerShips, setPlayerShips] = useState([]);
  const [salvoLocations, setSalvoLocations] = useState({ player: [], opponent: [] });
  //initializes empty arrays for player and opponent.

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<h1>Please enter 'localhost3000/game_view/PlayerId' into the URL</h1>} />
          <Route path="/game_view/:gpId"
            element={
              <>
                <GameInfo
                  setPlayerShips={setPlayerShips}
                  setSalvoLocations={setSalvoLocations} />
                <CreateGrid
                  playerShips={playerShips}
                  opponentSalvoes={salvoLocations?.opponent}
                />
                <CreateGridSalvo playerSalvoes={salvoLocations?.player || []} />
              </>
            }
          />
        </Routes>
      </Router>
    </>

  );
}

export default App;
