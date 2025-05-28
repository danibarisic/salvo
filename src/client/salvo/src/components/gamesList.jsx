import React, { useEffect, useState } from 'react';
import '../index.css';

export const GameList = () => {
    const [games, setGames] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("http://localhost:8080/api/games");
                const data = await res.json();
                setGames(data);

            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, []);

    return (
        <>
            <h1>Salvo Games</h1>
            <div className="gameBorder">
                <ul>
                    {games.map(game => (
                        <li key={game.id}>
                            <p>Game: {game.id} - Started on {new Date(game.created).toLocaleString()}</p>
                            <p>Players:</p>
                            <ul>
                                {game.gamePlayers.map(gp => (
                                    <li className="playerEmail" key={gp.id}>{gp.player.email}</li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>
            </div>

        </>
    );
}