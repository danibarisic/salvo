import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../index.css';

export const GameInfo = () => {
    const [games, setGames] = useState(null);
    const { gpId } = useParams(); //Fetches the player number from the URL.
    const gpIdNum = parseInt(gpId, 10);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`http://localhost:8080/api/game_view/${gpId}`);
                const data = await res.json();
                setGames(data);

            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, [gpId]);

    if (!games) {
        return <h1>Loading game...</h1>;
    }
    console.log('gpId from URL:', gpId);
    console.log('gameId from API response:', games.gameId);
    const gamePlayer = games.gamePlayers.find(gp => gp.id === gpIdNum);
    const opponent = games.gamePlayers.find(gp => gp.id !== gpIdNum);

    return (
        <>
            <h1>Ship Locations</h1>
            <div className="gameBorder">
                <p>Game: {games.gameId} - started on {new Date(games.created).toLocaleString()}</p>
                <p>Player: {gamePlayer ? gamePlayer.player.email : "Player not found."}</p>
                <p>Opponent: {opponent ? opponent.player.email : "Waiting for opponent..."}</p>
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