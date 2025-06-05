import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../index.css';

export const GameInfo = ({ setPlayerShips, setSalvoLocations }) => {
    const [games, setGames] = useState(null);
    const { gpId } = useParams(); //Fetches the player number from the URL.
    const gpIdNum = parseInt(gpId, 10); //Converts the string into an integer.

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`http://localhost:8080/api/game_view/${gpId}`);
                const data = await res.json();
                setGames(data);

                const allSalvoes = data?.salvoes || [];
                const playerSalvoes = allSalvoes.filter(salvo => salvo.gamePlayer === gpIdNum) || []; //filters only the current players salvoes.
                const opponentSalvoes = allSalvoes.filter(salvo => salvo.gamePlayer !== gpIdNum) || [];
                setPlayerShips(data?.ships || []);//if there is data, load ships otherwise empty array.
                setSalvoLocations({
                    player: playerSalvoes,
                    opponent: opponentSalvoes
                });

            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, [gpId, gpIdNum, setPlayerShips, setSalvoLocations]);

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
export const CreateGrid = ({ playerShips = [], opponentSalvoes = [] }) => {
    const letters = 'ABCDEFGHIJ'.split(''); //Create an array of letters A - J.
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; //Create an array of digits 1 - 10.
    const shipLocations = new Set(
        playerShips.flatMap(ship => ship.locations)
    )
    const opponentHits = new Set(
        opponentSalvoes.flatMap(salvo => salvo.locations)
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
                        const isHit = opponentHits.has(coord);
                        const isShipHit = isShip && isHit;

                        return (
                            <div
                                key={n} //Changes the classes depending if the cell is a ship, is hit, or a ship that's hit.
                                className={`cell 
                                    ${isShipHit ? 'ship-hit-cell' : ''}
                                    ${!isShipHit && isShip ? 'ship-cell' : ''} 
                                    ${!isShipHit && isHit ? 'opponent-salvo-cell' : ''}
                                    `}
                            ></div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
};