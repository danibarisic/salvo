import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../index.css';

export const GameList = ({ player, onLogout }) => {
    const [games, setGames] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGames = async () => {
            const res = await fetch('http://localhost:8080/api/games', { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setGames(data.games);
            }
        };
        fetchGames();
    }, []);

    const GetGameLink = (gamePlayers) => {
        const currentPlayerGP = gamePlayers.find(gp => gp.player.email === player?.email);
        return currentPlayerGP ? `/game_view/${currentPlayerGP.id}` : null;
    };

    const handleJoinGame = async (gameId) => {
        try {
            const res = await fetch(`http://localhost:8080/api/game/${gameId}/players`, {
                method: 'POST',
                credentials: 'include',
            });

            if (!res.ok) {
                const errorData = await res.json();
                alert(errorData.error || 'Failed to join game');
                return;
            }

            const data = await res.json();
            navigate(`/game_view/${data.gpid}`);
        } catch (err) {
            alert('Network error: ' + err.message);
        }
    };

    return (
        <div className="game-list">
            <h2>Games</h2>
            <button onClick={onLogout}>Logout</button>
            <ul className="game-list-container">
                {games.map((game) => {
                    const link = GetGameLink(game.gamePlayers);
                    const players = game.gamePlayers.map(gp => gp.player.email).join(' vs ');

                    return (
                        <li key={game.id} className="game-list-item">
                            <div className="game-info">
                                {link ? (
                                    <Link to={link} className="game-link">
                                        Game #{game.id} ({players})
                                    </Link>
                                ) : (
                                    <span className="game-link-nonclickable">
                                        Game #{game.id} ({players})
                                    </span>
                                )}
                            </div>
                            {!link && game.gamePlayers.length === 1 && (
                                <button
                                    className="join-btn"
                                    onClick={() => handleJoinGame(game.id)}
                                >
                                    Join
                                </button>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};
