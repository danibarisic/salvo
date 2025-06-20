
import React, { useState } from 'react';
import './App.css';
import { GameInfo, CreateGrid } from './components/game.jsx'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { CreateGridSalvo } from './components/createGridSalvo.jsx';
import { Leaderboard } from './components/Leaderboard.jsx';
import { Login } from './components/login.jsx';

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
                <Login />
                <GameInfo
                  setPlayerShips={setPlayerShips} //State setter functions passed from parent components.
                  setSalvoLocations={setSalvoLocations} />
                <CreateGrid
                  playerShips={playerShips} //PlayerShips and salvoLocations are pulled from game.jsx and createGridSalvo.jsx.
                  opponentSalvoes={salvoLocations?.opponent}
                />
                <CreateGridSalvo playerSalvoes={salvoLocations?.player || []}
                //If salvoLocations exists then the player salvoes will display, otherwise empty array.
                />
              </>
            }
          />
          <Route path="/leaderboard" element={<Leaderboard />}
          //path to leaderboard simply displays the Leaderboard component.
          />
          <Route path="/login" element={<Login />}
          //path to leaderboard simply displays the Leaderboard component.
          />
        </Routes>
      </Router>
    </>

  );
}

export default App;
