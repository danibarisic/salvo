import React, { useState, useEffect } from 'react';
import './App.css';
import { GameInfo, CreateGrid } from './components/GameView.jsx';
import { BrowserRouter as Router, Route, Routes, useParams } from 'react-router-dom';
import { CreateGridSalvo } from './components/createGridSalvo.jsx';
import { Leaderboard } from './components/Leaderboard.jsx';
import { Login } from './components/login.jsx';

function GameViewRoute({ player, playerShips, salvoLocations, setPlayerShips, setSalvoLocations }) {
  const { gpId } = useParams();

  if (!player) return <Login />;

  return (
    <>
      <GameInfo
        gpId={gpId}
        setPlayerShips={setPlayerShips}
        setSalvoLocations={setSalvoLocations}
      />
      <CreateGrid playerShips={playerShips} opponentSalvoes={salvoLocations.opponent || []} />
      <CreateGridSalvo playerSalvoes={salvoLocations.player || []} />
    </>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [playerShips, setPlayerShips] = useState([]);

  const [salvoLocations, setSalvoLocations] = useState({ player: [], opponent: [] });

  useEffect(() => {
    const fetchCurrentPlayer = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/current-player', {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (err) {
        console.log('Not logged in yet');
      }
    };

    fetchCurrentPlayer();
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<h1>Please enter 'localhost:3000/game_view/PlayerId' into the URL</h1>}
        />
        <Route
          path="/game_view/:gpId"
          element={
            user ? (
              <GameViewRoute
                player={user}
                playerShips={playerShips}
                salvoLocations={salvoLocations}
                setPlayerShips={setPlayerShips}
                setSalvoLocations={setSalvoLocations}
              />
            ) : (
              <Login
                onLogin={(userData) => {
                  setUser(userData);
                  console.log('Logged in as:', userData);
                }}
                onLogout={() => {
                  setUser(null);
                  console.log('Logged out');
                }}
              />
            )
          }
        />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route
          path="/login"
          element={
            <Login
              onLogin={(userData) => setUser(userData)}
              onLogout={() => setUser(null)}
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
