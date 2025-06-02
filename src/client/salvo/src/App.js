
import React, { useState } from 'react';
import './App.css';
import { GameInfo, CreateGrid } from './components/game.jsx'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  const [playerShips, setPlayerShips] = useState([]);
  return (
    <>
      <Router>
        <Routes>
          <Route path="/game_view/:gpId"
            element={
              <>
                <GameInfo setPlayerShips={setPlayerShips} />
                <CreateGrid playerShips={playerShips} />
              </>
            }
          />
        </Routes>
      </Router>
    </>

  );
}

export default App;
