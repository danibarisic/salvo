import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../index.css';

export const GameInfo = () => {
    const [games, setGames] = useState(null);
    const { gameId } = useParams(); //Fetches the game number from the URL.

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`http://localhost:8080/api/game_view/${gameId}`);
                const data = await res.json();
                setGames(data);

            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, [gameId]);

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

// Component for creating the grid.
export const CreateGrid = () => {
    const letters = 'ABCDEFGHIJ'.split(''); //Create an array of letters A - J.
    const numbers = Array.from({ length: 10 }, (value, i) => i + 1); //Create an array of digits 1 - 10.

    return (
        <div className="grid-container">
            <div className="row header">
                <div className="cell corner"></div>
                {numbers.map(n => (
                    <div key={n} className="cell header-cell">{n}</div> //Creates a square-like div for each number from numbers.
                ))}
            </div>

            {letters.map(letter => ( //Create a lettered box, then 10 consecutive empty ones. One row for each letter.
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