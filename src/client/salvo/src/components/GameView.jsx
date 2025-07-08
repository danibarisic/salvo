import React, { useEffect, useState, useCallback, useRef } from 'react';
import { ShipPlacer } from './ShipPlacer.jsx';
import { SalvoPlacer } from './SalvoPlacer.jsx';

export const GameView = ({
    gpId,
    playerShips,
    setPlayerShips,
    salvoLocations,
    setSalvoLocations,
    user,
}) => {
    const [gameData, setGameData] = useState(null);
    const [currentPlayerEmail, setCurrentPlayerEmail] = useState('');
    const [gamePlayerId, setGamePlayerId] = useState(null);
    const [isMyTurn, setIsMyTurn] = useState(false);
    const [checkingUpdates, setCheckingUpdates] = useState(false);
    const pollingIntervalRef = useRef(null);

    const fetchGameData = useCallback(async () => {
        if (!user || !user.id) return;

        try {
            setCheckingUpdates(true);
            const response = await fetch(`http://localhost:8080/api/game_view/${gpId}`, {
                credentials: 'include',
            });
            if (!response.ok) throw new Error('Failed to fetch game data');

            const data = await response.json();
            setGameData(data);

            const thisGamePlayer = data.gamePlayers?.find((gp) => gp.player.id === user.id);
            if (!thisGamePlayer) {
                setCurrentPlayerEmail('Unknown player');
                setGamePlayerId(null);
                setIsMyTurn(false);
                setCheckingUpdates(false);
                return;
            }

            setCurrentPlayerEmail(thisGamePlayer.player.email);
            setGamePlayerId(thisGamePlayer.id);

            // Filter player's ships
            const playerOnlyShips = (data.ships || []).filter(
                (ship) => ship.ownerId === thisGamePlayer.id
            );
            setPlayerShips(playerOnlyShips);

            // Separate salvo locations
            const salvos = data.salvoes || [];
            const playerSalvoes = salvos
                .filter((salvo) => salvo.gamePlayer === thisGamePlayer.id)
                .flatMap((salvo) => salvo.locations);
            const opponentSalvoes = salvos
                .filter((salvo) => salvo.gamePlayer !== thisGamePlayer.id)
                .flatMap((salvo) => salvo.locations);
            setSalvoLocations({
                player: playerSalvoes,
                opponent: opponentSalvoes,
            });

            //Turn Logic
            // Count how many turns each player has taken
            const myTurnsCount = salvos.filter(salvo => salvo.gamePlayer === thisGamePlayer.id).length;
            const opponentTurnsCount = salvos.filter(salvo => salvo.gamePlayer !== thisGamePlayer.id).length;

            // Your turn if you have fired equal or fewer times than opponent
            const myTurnNow = myTurnsCount <= opponentTurnsCount;

            console.log('My Turns Count:', myTurnsCount);
            console.log('Opponent Turns Count:', opponentTurnsCount);
            console.log('Is my turn:', myTurnNow);

            setIsMyTurn(myTurnNow);
            setCheckingUpdates(false);
        } catch (error) {
            console.error('Error fetching game data:', error);
            setCheckingUpdates(false);
        }
    }, [gpId, user, setPlayerShips, setSalvoLocations]);

    // Initial fetch on mount or gpId/user change
    useEffect(() => {
        fetchGameData();
    }, [fetchGameData]);

    // Polling only when it's not the player's turn and gameData is loaded
    useEffect(() => {
        if (gameData && !isMyTurn) {
            pollingIntervalRef.current = setInterval(() => {
                fetchGameData();
            }, 5000);

            return () => clearInterval(pollingIntervalRef.current);
        }

        // Clear interval if player turn changes to avoid multiple intervals
        return () => clearInterval(pollingIntervalRef.current);
    }, [gameData, isMyTurn, fetchGameData]);

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
                    ? gameData.gamePlayers.map((gp) => gp.player?.email || 'Unknown').join(' vs ')
                    : 'No players found'}
            </p>

            {!allShipsPlaced ? (
                <>
                    <p>Place your ships to start the game.</p>
                    <ShipPlacer gamePlayerId={gamePlayerId} setPlayerShips={setPlayerShips} />
                </>
            ) : isMyTurn ? (
                <>
                    <CreateGrid
                        playerShips={playerShips}
                        opponentSalvoes={salvoLocations.opponent || []}
                        hitHistory={gameData.hitHistory || []}
                    />
                    <SalvoPlacer
                        gamePlayerId={gamePlayerId}
                        playerSalvoes={salvoLocations.player || []}
                        previouslyFired={salvoLocations.player || []}
                        salvoSubmitted={fetchGameData}
                        hitHistory={gameData.hitHistory || []}
                    />
                    <HitHistoryDisplay hitHistory={gameData.hitHistory || []} />
                </>
            ) : (
                <p>
                    Waiting for other player to make a move...
                    {checkingUpdates && ' (Checking for updates...)'}
                </p>
            )}
        </div>
    );
};

export const CreateGrid = ({ playerShips = [], opponentSalvoes = [], hitHistory = [] }) => {
    const letters = 'ABCDEFGHIJ'.split('');
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    // Gather ship locations by type
    const shipLocations = new Map();
    playerShips.forEach((ship) => {
        ship.locations.forEach((loc) => {
            shipLocations.set(loc, ship.type);
        });
    });

    // Flatten sunk ships locations (for coloring sunk ships)
    const sunkShips = new Set();
    hitHistory.forEach((turn) => {
        turn.sunkShips.forEach((shipType) => {
            playerShips
                .filter((ship) => ship.type === shipType)
                .forEach((ship) => ship.locations.forEach((loc) => sunkShips.add(loc)));
        });
    });

    return (
        <div className="grid-container">
            <div className="row header">
                <div className="cell corner"></div>
                {numbers.map((n) => (
                    <div key={n} className="cell header-cell">
                        {n}
                    </div>
                ))}
            </div>

            {letters.map((letter) => (
                <div key={letter} className="row">
                    <div className="cell header-cell">{letter}</div>
                    {numbers.map((n) => {
                        const coord = `${letter}${n}`;
                        const isShip = shipLocations.has(coord);
                        const isHit = opponentSalvoes.includes(coord);
                        const isSunk = sunkShips.has(coord);
                        const isShipHit = isShip && isHit;

                        return (
                            <div
                                key={n}
                                className={`cell
                  ${isSunk ? 'sunk-ship-cell' : ''}
                  ${!isSunk && isShipHit ? 'ship-hit-cell' : ''}
                  ${!isShipHit && isShip ? 'ship-cell' : ''}
                  ${!isShipHit && !isShip && isHit ? 'opponent-salvo-cell' : ''}
                `}
                                title={
                                    isSunk
                                        ? `Sunk Ship: ${shipLocations.get(coord)}`
                                        : isShipHit
                                            ? `Hit Ship: ${shipLocations.get(coord)}`
                                            : isShip
                                                ? 'Ship'
                                                : isHit
                                                    ? 'Miss'
                                                    : ''
                                }
                            ></div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
};

// Component to render the hit history with details per turn
const HitHistoryDisplay = ({ hitHistory }) => {
    if (!Array.isArray(hitHistory) || hitHistory.length === 0) {
        return <p>No hits yet.</p>;
    }

    return (
        <div className="hit-history">
            <h3 className='hit-history-title'>Hit History</h3>
            {hitHistory.map((turn) => (
                <div key={turn.turn} className="turn-report">
                    <strong>Turn {turn.turn}:</strong>
                    <div>
                        Hits this turn: {turn.hitLocations?.length > 0 ? turn.hitLocations.join(', ') : 'None'}
                    </div>
                    <div>
                        Sunk Ships: {turn.sunkShips?.length > 0 ? turn.sunkShips.join(', ') : 'None'}
                    </div>
                    <div>
                        Cumulative Hits: {(turn.cumulativeHits ?? []).join(', ')}
                    </div>
                </div>
            ))}
        </div>
    );
};

