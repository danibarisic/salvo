
import React from 'react';
import './App.css';
import { GameInfo, CreateGrid } from './components/game.jsx'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/game_view/:gpId"
            element={
              <>
                <GameInfo />
                <CreateGrid />
              </>
            }
          />
        </Routes>
      </Router>
    </>

  );
}

export default App;
