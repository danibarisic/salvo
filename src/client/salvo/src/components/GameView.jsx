import React, { useEffect, useState } from 'react';
import { ShipPlacer } from './ShipPlacer.jsx';
import { SalvoPlacer } from './SalvoPlacer.jsx';

export const GameView = ({ gpId, playerShips, setPlayerShips, salvoLocations, setSalvoLocations, user }) => {
    const [gameData, setGameData] = useState(null);
    const [currentPlayerEmail, setCurrentPlayerEmail] = useState('');
    const [gamePlayerId, setGamePlayerId] = useState(null);

    useEffect(() => {
        if (!user || !user.id) return;
        const fetchGameData = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/game_view/${gpId}`, {
                    credentials: 'include',
                });
                if (!response.ok) throw new Error('Failed to fetch game data');

                const data = await response.json();
                setGameData(data);

                setPlayerShips(data.ships || []);

                // Find the gamePlayer matching the logged in user ID

                const thisGamePlayer = data.gamePlayers?.find(gp => gp.player.id === user.id);

                if (!thisGamePlayer) {
                    console.error("Current user not found in game players");
                    setCurrentPlayerEmail('Unknown player');
                    setGamePlayerId(null);
                    return;
                }

                setCurrentPlayerEmail(thisGamePlayer.player.email);
                setGamePlayerId(thisGamePlayer.id);

                const playerOnlyShips = (data.ships || []).filter(ship => ship.ownerId === thisGamePlayer.id);
                setPlayerShips(playerOnlyShips);

                const salvos = data.salvoes || [];
                const playerSalvoes = salvos
                    .filter(salvo => salvo.gamePlayer === thisGamePlayer.id)
                    .flatMap(salvo => salvo.locations);
                const opponentSalvoes = salvos
                    .filter(salvo => salvo.gamePlayer !== thisGamePlayer.id)
                    .flatMap(salvo => salvo.locations);

                setSalvoLocations({
                    player: playerSalvoes,
                    opponent: opponentSalvoes,
                });
            } catch (error) {
                console.error('Error fetching game data:', error);
            }
        };

        fetchGameData();
    }, [gpId, setPlayerShips, setSalvoLocations, user]);

    if (!gameData) return <p>Loading game info...</p>;

    const allShipsPlaced = (playerShips?.length || 0) >= 2;

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

            {!allShipsPlaced ? (
                <ShipPlacer gamePlayerId={gamePlayerId} setPlayerShips={setPlayerShips} />
            ) : (
                <>
                    <CreateGrid
                        playerShips={playerShips}
                        opponentSalvoes={salvoLocations.opponent || []}
                    />
                    <SalvoPlacer
                        gamePlayerId={gamePlayerId}
                        playerSalvoes={salvoLocations.player || []}
                        previouslyFired={salvoLocations.player || []}
                        onSalvoSubmitted={() => window.location.reload()}
                    />
                </>
            )}
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
                        const coordinates = `${letter}${n}`;
                        const isShip = shipLocations.has(coordinates);
                        const isHit = opponentHits.has(coordinates);
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
