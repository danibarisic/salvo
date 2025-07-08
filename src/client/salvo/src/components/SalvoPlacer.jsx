import React, { useState, useMemo } from 'react';

export const SalvoPlacer = ({
    gamePlayerId,
    playerSalvoes = [],
    previouslyFired = [],
    salvoSubmitted,
    hitHistory = [], // Defaults to empty array
}) => {
    const [selectedCells, setSelectedCells] = useState([]);
    const maxShots = 5;
    const letters = 'ABCDEFGHIJ'.split('');
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    // Build a set of all opponent hit locations from hitHistory
    const opponentHitLocations = useMemo(() => {
        const hits = new Set();
        hitHistory?.forEach(turn => {
            turn?.hitLocations?.forEach(loc => hits.add(loc));
        });
        return hits;
    }, [hitHistory]);

    const toggleCell = (cell) => {
        if (previouslyFired.includes(cell)) return;

        setSelectedCells((previousShot) => {
            if (previousShot.includes(cell)) {
                return previousShot.filter((c) => c !== cell);
            } else if (previousShot.length < maxShots) {
                return [...previousShot, cell];
            } else {
                return previousShot;
            }
        });
    };

    const submitSalvo = async () => {
        if (selectedCells.length === 0) {
            alert("Select at least one cell");
            return;
        }

        const nextTurn = playerSalvoes.length + 1;

        try {
            const response = await fetch(`http://localhost:8080/api/games/players/${gamePlayerId}/salvos`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    turnCount: nextTurn,
                    locations: selectedCells
                })
            });

            if (!response.ok) {
                alert("Error submitting salvo");
                return;
            }

            alert("Salvo submitted!");
            setSelectedCells([]);
            try {
                salvoSubmitted();
            } catch (error) {
                console.error(error);
            }

        } catch (error) {
            console.error(error);
            alert("Network or server error with submission");
        }
    };

    const isSelected = (cell) => selectedCells.includes(cell);
    const isPreviouslyFired = (cell) => previouslyFired.includes(cell);
    const isHit = (cell) => opponentHitLocations.has(cell);

    return (
        <div className="salvo-container">
            <h3>Select up to 5 shots</h3>
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
                            const cellId = `${letter}${n}`;
                            const used = isPreviouslyFired(cellId);
                            const chosen = isSelected(cellId);
                            const hit = isHit(cellId);

                            return (
                                <div
                                    key={cellId}
                                    className={`cell salvo-cell
                                        ${used ? 'already-fired' : ''}
                                        ${chosen ? 'selected' : ''}
                                        ${hit ? 'hit-opponent-ship' : ''}
                                    `}
                                    onClick={() => toggleCell(cellId)}
                                    title={hit ? 'Hit opponent ship!' : ''}
                                ></div>
                            );
                        })}
                    </div>
                ))}
            </div>

            <button
                className="submit-button"
                onClick={submitSalvo}
            >
                Submit Salvo
            </button>
        </div>
    );
};
