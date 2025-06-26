import React, { useState, useEffect } from 'react';
import { Route, Routes, useNavigate, Navigate, useParams } from 'react-router-dom';
import { GameInfo, CreateGrid } from './components/GameView.jsx';
import { CreateGridSalvo } from './components/createGridSalvo.jsx';
import { Leaderboard } from './components/Leaderboard.jsx';
import { Login } from './components/login.jsx';
import { GameList } from './components/gamesList.jsx';

function GameViewRoute({ player, playerShips, salvoLocations, setPlayerShips, setSalvoLocations }) {
  const { gpId } = useParams();

  if (!player) return <Navigate to="/" replace />;

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
  const [loadingUser, setLoadingUser] = useState(true);
  const [playerShips, setPlayerShips] = useState([]);
  const [salvoLocations, setSalvoLocations] = useState({ player: [], opponent: [] });

  const navigate = useNavigate();

  // Fetch current player info
  const fetchCurrentPlayer = async () => {
    setLoadingUser(true);
    try {
      const res = await fetch('http://localhost:8080/api/current-player', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    fetchCurrentPlayer();
  }, []);

  // Handle logout and refresh user state
  const handleLogout = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        await fetchCurrentPlayer(); // Refresh user state after logout
        navigate('/');
      } else {
        console.error('Logout failed');
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (loadingUser) return <div>Loading user...</div>;

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? (
            <GameList player={user} onLogout={handleLogout} />
          ) : (
            <Login onLogin={(userData) => setUser(userData)} />
          )
        }
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
            <Navigate to="/" replace />
          )
        }
      />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
