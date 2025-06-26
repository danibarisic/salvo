import React, { useEffect, useState } from 'react';

export const GameInfo = ({ gpId, setPlayerShips, setSalvoLocations }) => {
    const [gameData, setGameData] = useState(null);
    const [currentPlayerEmail, setCurrentPlayerEmail] = useState('');

    useEffect(() => {
        const fetchGameData = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/game_view/${gpId}`, {
                    credentials: 'include',
                });
                if (!response.ok) throw new Error('Failed to fetch game data');

                const data = await response.json();
                setGameData(data);

                setPlayerShips(data.ships || []);

                const thisGamePlayer = data.gamePlayers.find(gp => gp.id === Number(gpId));
                if (!thisGamePlayer) throw new Error("Game player not found");

                setCurrentPlayerEmail(thisGamePlayer.player.email);

                const salvos = data.salvoes || [];
                const playerSalvoes = salvos
                    .filter(s => s.gamePlayer === thisGamePlayer.id)
                    .flatMap(s => s.locations);
                const opponentSalvoes = salvos
                    .filter(s => s.gamePlayer !== thisGamePlayer.id)
                    .flatMap(s => s.locations);

                setSalvoLocations({
                    player: playerSalvoes,
                    opponent: opponentSalvoes,
                });
            } catch (error) {
                console.error('Error fetching game data:', error);
            }
        };

        fetchGameData();
    }, [gpId, setPlayerShips, setSalvoLocations]);

    if (!gameData) return <p>Loading game info...</p>;

    return (
        <div className="game-info">
            <h1 className="welcome-header">Welcome, {currentPlayerEmail}</h1>
            <h2 className="game-started">
                Game Started: {new Date(gameData.created).toLocaleString()}
            </h2>
            <p className="players-list">
                Players:{' '}
                {gameData.gamePlayers?.length
                    ? gameData.gamePlayers.map(gp => gp.player?.email || 'Unknown').join(' vs ')
                    : 'No players found'}
            </p>
        </div>
    );
};

export const CreateGrid = ({ playerShips = [], opponentSalvoes = [] }) => {
    const letters = 'ABCDEFGHIJ'.split('');
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    const shipLocations = new Set(playerShips.flatMap(ship => ship.locations));
    const opponentHits = new Set(opponentSalvoes);

    return (
        <div className="grid-container">
            <div className="row header">
                <div className="cell corner"></div>
                {numbers.map(n => (
                    <div key={n} className="cell header-cell">{n}</div>
                ))}
            </div>

            {letters.map(letter => (
                <div key={letter} className="row">
                    <div className="cell header-cell">{letter}</div>
                    {numbers.map(n => {
                        const coord = `${letter}${n}`;
                        const isShip = shipLocations.has(coord);
                        const isHit = opponentHits.has(coord);
                        const isShipHit = isShip && isHit;

                        return (
                            <div
                                key={n}
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
