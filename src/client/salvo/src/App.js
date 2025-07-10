import React, { useState, useEffect } from 'react';
import { Route, Routes, useNavigate, Navigate, useParams } from 'react-router-dom';
import { GameView } from './components/GameView.jsx';
import { Leaderboard } from './components/Leaderboard.jsx';
import { Login } from './components/login.jsx';
import { GameList } from './components/gamesList.jsx';

function GameViewRoute({ player, playerShips, salvoLocations, setPlayerShips, setSalvoLocations }) {
  const { gpId } = useParams();

  if (!player) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="game-layout">
      <GameView
        gpId={gpId}
        playerShips={playerShips}
        setPlayerShips={setPlayerShips}
        salvoLocations={salvoLocations}
        setSalvoLocations={setSalvoLocations}
        user={player}
      />
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [playerShips, setPlayerShips] = useState([]);
  const [salvoLocations, setSalvoLocations] = useState({ player: [], opponent: [] });

  const navigate = useNavigate();

  const fetchCurrentPlayer = async () => {
    setLoadingUser(true);
    try {
      const response = await fetch('http://localhost:8080/api/current-player', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        setUser(null);
        console.log('No current user or session expired.');
      }
    } catch (error) {
      console.error(error);
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    fetchCurrentPlayer();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        await fetchCurrentPlayer(); // Re-fetch to confirm logged out state
        navigate('/');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error(error);
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