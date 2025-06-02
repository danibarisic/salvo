import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../index.css';

export const GameInfo = ({ setPlayerShips }) => {
    const [games, setGames] = useState(null);
    const { gpId } = useParams(); //Fetches the player number from the URL.
    const gpIdNum = parseInt(gpId, 10);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`http://localhost:8080/api/game_view/${gpId}`);
                const data = await res.json();
                setGames(data);
                setPlayerShips(data.ships || []);

            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, [gpId, setPlayerShips]);

    if (!games) {
        return <h1>Loading game...</h1>;
    }

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
export const CreateGrid = ({ playerShips = [] }) => {
    const letters = 'ABCDEFGHIJ'.split(''); //Create an array of letters A - J.
    const numbers = Array.from({ length: 10 }, (value, i) => i + 1); //Create an array of digits 1 - 10.
    const shipLocations = new Set(
        playerShips.flatMap(ship => ship.locations)
    )

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
                    {numbers.map(n => {
                        const coord = `${letter}${n}`;
                        const isShip = shipLocations.has(coord);

                        return (
                            <div
                                key={n}
                                className={`cell ${isShip ? 'ship-cell' : ''}`}
                            //if the cell contains a location it becomes a ship-cell which will be coloured and marked on the grid, with ship-cell styling.
                            ></div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
};