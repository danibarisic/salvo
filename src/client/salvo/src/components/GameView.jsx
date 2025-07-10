import React, { useEffect, useState, useCallback, useRef } from 'react';
import { ShipPlacer } from './ShipPlacer.jsx';
import { SalvoPlacer } from './SalvoPlacer.jsx';

// (CreateGrid and HitHistoryDisplay components remain the same as in your last provided code)
// Make sure CreateGrid and HitHistoryDisplay are exported from this file
// or imported if they are in separate files.
export const CreateGrid = ({ playerShips = [], opponentSalvoes = [], hitHistory = [] }) => {
    const letters = 'ABCDEFGHIJ'.split('');
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    const shipLocations = new Map();
    playerShips.forEach((ship) => {
        ship.locations.forEach((loc) => {
            shipLocations.set(loc, ship.type);
        });
    });

    const sunkShips = new Set();
    hitHistory.forEach((turn) => {
        if (Array.isArray(turn.sunkShips)) {
            turn.sunkShips.forEach((shipType) => {
                playerShips
                    .filter((ship) => ship.type === shipType)
                    .forEach((ship) => ship.locations.forEach((loc) => sunkShips.add(loc)));
            });
        }
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
                        const coordinates = `${letter}${n}`;
                        const isShip = shipLocations.has(coordinates);
                        const isHit = opponentSalvoes.includes(coordinates);
                        const isSunk = sunkShips.has(coordinates);
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
                                        ? `Sunk Ship: ${shipLocations.get(coordinates)}`
                                        : isShipHit
                                            ? `Hit Ship: ${shipLocations.get(coordinates)}`
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

export const HitHistoryDisplay = ({ hitHistory }) => {
    if (!Array.isArray(hitHistory) || hitHistory.length === 0) {
        return (
            <div className="hit-history">
                <h3 className="hit-history-title">Opponent Hit History</h3>
                <p>No hit history yet.</p>
            </div>
        );
    }
    return (
        <div className="hit-history">
            <h3 className="hit-history-title">Opponent Hit History</h3>
            {hitHistory.map((turnReport, index) => (
                <div key={index} style={{ marginBottom: '10px', borderBottom: '1px solid #444', paddingBottom: '5px' }}>
                    <p><strong>Turn {turnReport.turn}:</strong></p>
                    <p>Hits this turn: {turnReport.hitsThisTurn && turnReport.hitsThisTurn.length > 0 ? turnReport.hitsThisTurn.join(', ') : 'None'}</p>
                    <p>Sunk ships: {turnReport.sunkShips && turnReport.sunkShips.length > 0 ? turnReport.sunkShips.join(', ') : 'None'}</p>
                    <p>Cumulative hits: {turnReport.cumulativeHits && turnReport.cumulativeHits.length > 0 ? turnReport.cumulativeHits.join(', ') : 'None'}</p>
                </div>
            ))}
        </div>
    );
};


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
    const [opponentShipsPlaced, setOpponentShipsPlaced] = useState(false);

    const myRequiredShips = 3;
    const opponentRequiredShips = 3;

    const fetchGameData = useCallback(async () => {
        if (!user || !user.id || !gpId) {
            setCheckingUpdates(false);
            return;
        }

        try {
            setCheckingUpdates(true);
            const response = await fetch(`http://localhost:8080/api/game_view/${gpId}`, {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch game data`);
            }

            const data = await response.json();
            setGameData(data);

            const numericGpId = Number(gpId);
            const thisGamePlayer = data.gamePlayers?.find((gp) => gp.id === numericGpId);

            if (!thisGamePlayer) {
                setCurrentPlayerEmail('Unknown player');
                setGamePlayerId(null);
                setIsMyTurn(false);
                setOpponentShipsPlaced(false);
                setCheckingUpdates(false);
                return;
            }

            setCurrentPlayerEmail(thisGamePlayer.player?.email || 'Unknown');
            setGamePlayerId(thisGamePlayer.id);

            const playerOnlyShips = (data.ships || []).filter(
                (ship) => ship.ownerId === thisGamePlayer.id
            );
            setPlayerShips(playerOnlyShips);

            const opponentGamePlayer = data.gamePlayers?.find((gp) => gp.id !== thisGamePlayer.id);

            let opponentOnlyShips = [];
            if (opponentGamePlayer) {
                const numericOpponentGamePlayerId = Number(opponentGamePlayer.id);
                opponentOnlyShips = (data.ships || []).filter(
                    (ship) => ship.ownerId === numericOpponentGamePlayerId
                );
            }

            const calculatedOpponentShipsPlaced = opponentOnlyShips.length === opponentRequiredShips;
            setOpponentShipsPlaced(calculatedOpponentShipsPlaced);

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

            // Turn Logic
            let turnStatus = false;

            // Check backend's explicit game state first
            if (data.gameState === "enter-salvo") {
                turnStatus = true;
            } else if (data.gameState === "wait") {
                const myShipsAreFullyPlaced = playerOnlyShips.length === myRequiredShips;

                if (!myShipsAreFullyPlaced || !calculatedOpponentShipsPlaced) {
                    turnStatus = false;
                } else {
                    turnStatus = false;
                }
            } else if (["game-over-won", "game-over-lost", "game-over-tied"].includes(data.gameState)) {
                turnStatus = false; // Game is over, no more turns
            }

            setIsMyTurn(turnStatus);
            setCheckingUpdates(false);

        } catch (error) {
            console.error(error);
            setCheckingUpdates(false);
        }
    }, [gpId, user, setPlayerShips, setSalvoLocations, opponentRequiredShips]);


    useEffect(() => {
        fetchGameData();
        return () => clearInterval(pollingIntervalRef.current);
    }, [fetchGameData]);

    useEffect(() => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
        }

        const isGameOver = ["game-over-won", "game-over-lost", "game-over-tied"].includes(gameData?.gameState);

        if (gameData && !isMyTurn && !isGameOver) {
            pollingIntervalRef.current = setInterval(() => {
                fetchGameData();
            }, 5000);
        }

        return () => clearInterval(pollingIntervalRef.current);
    }, [gameData, isMyTurn, fetchGameData]);


    if (!gameData || gamePlayerId === null) {
        return <p>Loading game information...</p>;
    }

    const myShipsAreFullyPlaced = (playerShips?.length || 0) === myRequiredShips;
    const currentGameState = gameData.gameState; // Get the game state from fetched data

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

            {currentGameState === "game-over-won" && (
                <h2 className="game-over-message won">You Won!</h2>
            )}
            {currentGameState === "game-over-lost" && (
                <h2 className="game-over-message lost">You Lost!</h2>
            )}
            {currentGameState === "game-over-tied" && (
                <h2 className="game-over-message tied">It's a Tie!</h2>
            )}

            {currentGameState === "place-ships" && gamePlayerId && (
                <>
                    <p>Place your ships to start the game.</p>
                    <ShipPlacer gamePlayerId={gamePlayerId} setPlayerShips={setPlayerShips} />
                </>
            )}

            {currentGameState === "wait" && !myShipsAreFullyPlaced && (
                <>
                    <p>Place your ships to start the game.</p>
                    <ShipPlacer gamePlayerId={gamePlayerId} setPlayerShips={setPlayerShips} />
                </>
            )}

            {currentGameState === "wait" && myShipsAreFullyPlaced && !opponentShipsPlaced && (
                <p>Waiting for opponent to place their ships... {checkingUpdates && ' (Checking for updates...)'}</p>
            )}

            {currentGameState === "wait" && myShipsAreFullyPlaced && opponentShipsPlaced && !isMyTurn && (
                // This state means both players have placed ships, but it's opponent's turn to fire
                <p>Waiting for other player to make a move... {checkingUpdates && ' (Checking for updates...)'}</p>
            )}

            {currentGameState === "enter-salvo" && isMyTurn && myShipsAreFullyPlaced && opponentShipsPlaced && (
                <>
                    <p>Fire Salvos!</p>
                    <h3>Your Board</h3>
                    <CreateGrid
                        playerShips={playerShips}
                        opponentSalvoes={salvoLocations.opponent}
                        hitHistory={gameData.hitHistory}
                    />
                    <h3>Fire Salvos!</h3>
                    <SalvoPlacer
                        gamePlayerId={gamePlayerId}
                        playerSalvoes={salvoLocations.player}
                        previouslyFired={salvoLocations.player}
                        salvoSubmitted={fetchGameData}
                        hitHistory={gameData.hitHistory}
                    />
                    <HitHistoryDisplay hitHistory={gameData.hitHistory} />
                </>
            )}

            {["game-over-won", "game-over-lost", "game-over-tied"].includes(currentGameState) && (
                <>
                    <h3>Final Board</h3>
                    <CreateGrid
                        playerShips={playerShips}
                        opponentSalvoes={salvoLocations.opponent || []}
                        hitHistory={gameData.hitHistory || []}
                    />
                    <HitHistoryDisplay hitHistory={gameData.hitHistory || []} />
                </>
            )}
        </div>
    );
};