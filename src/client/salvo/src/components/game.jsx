import React, { useEffect, useState } from 'react';
import '../index.css';

export const GameInfo = () => {
    const [games, setGames] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("http://localhost:8080/api/game_view/1");
                const data = await res.json();
                setGames(data);

            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, []);

    if (!games) {
        return <h1>Loading game...</h1>;
    }

    return (
        <>
            <h1>Ship Locations</h1>
            <div className="gameBorder">
                <p>Game: {games.gameId} - started on {new Date(games.created).toLocaleString()}</p>
                <p>Players:</p>
                <ul>
                    {games.gamePlayers.map(gp => (
                        <li className="playerEmail" key={gp.id}>{gp.player.email}</li>
                    ))}
                </ul>
            </div>
        </>
    );
}

export const CreateGrid = () => {
    const letters = 'ABCDEFGHIJ'.split('');
    const numbers = Array.from({ length: 10 }, (_, i) => i + 1);

    return (
        <div className="grid-container">
            {/* Header row */}
            <div className="row header">
                <div className="cell corner"></div>
                {numbers.map(n => (
                    <div key={n} className="cell header-cell">{n}</div>
                ))}
            </div>

            {/* Grid rows */}
            {letters.map(letter => (
                <div key={letter} className="row">
                    <div className="cell header-cell">{letter}</div>
                    {numbers.map(n => (
                        <div key={n} className="cell"></div>
                    ))}
                </div>
            ))}
        </div>
    );
};