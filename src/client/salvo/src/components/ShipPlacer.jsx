import React, { useState } from "react";

export const ShipPlacer = ({ gamePlayerId }) => {
    const requiredShips = [
        { type: "submarine", size: 3 },
        { type: "destroyer", size: 3 },
        { type: "patrol boat", size: 2 },
    ];

    const [placedShips, setPlacedShips] = useState([]);
    const [selectedShipType, setSelectedShipType] = useState(null);
    const [orientation, setOrientation] = useState("H");

    const postShips = async () => {
        try {
            const response = await fetch(`/api/game/${gamePlayerId}/ships`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(placedShips),
            });

            if (response.status === 201) {
                console.log("Ships posted successfuly");
                fetchGameView();

            } else if (response.status === 401) {
                console.warn("Unauthorized: User not logged in or wrong user.");
            } else if (response.status === 403) {
                console.warn("Forbidden: Ships already placed.");
            } else {
                const errorData = await response.json();
                console.error("Error posting ships:", errorData);
            }
        } catch (error) {
            console.error("Network or server error:", error);
        }
    };

    const fetchGameView = async () => {
        try {
            const response = await fetch(`/api/game_view/${gamePlayerId}`, {
                credentials: "include",
            });
            if (response.ok) {
                const gameView = await response.json();
                console.log("Updated game view:", gameView);
            } else {
                console.warn("Failed to fetch updated game view.");
            }
        } catch (error) {
            console.error("Error fetching game view:", error);
        }
    };

    const letters = "ABCDEFGHIJ".split("");
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    // Helper to calculate ship cells based on starting coord
    const getShipLocations = (start, size, orientation) => {
        const [rowLetter, ...numPart] = start;
        const rowIndex = letters.indexOf(rowLetter);
        const colIndex = parseInt(numPart.join("")) - 1;

        let locations = [];

        for (let i = 0; i < size; i++) {
            const r = orientation === "V" ? rowIndex + i : rowIndex;
            const c = orientation === "H" ? colIndex + i : colIndex;

            if (r > 9 || c > 9) return null; // Out of bounds

            locations.push(`${letters[r]}${c + 1}`);
        }

        return locations;
    };

    // Helper function to check overlap
    const isOverlapping = (locations) => {
        const allOccupied = placedShips.flatMap(s => s.locations);
        return locations.some(loc => allOccupied.includes(loc));
    };

    const handleCellClick = (cell) => {
        if (!selectedShipType) return;

        const shipSize = requiredShips.find(s => s.type === selectedShipType).size;
        const locations = getShipLocations(cell, shipSize, orientation);

        if (!locations) {
            alert("Ship would be off the board.");
            return;
        }
        if (isOverlapping(locations)) {
            alert("Ship would overlap another ship.");
            return;
        }

        const newShip = {
            type: selectedShipType,
            locations,
        };

        setPlacedShips([...placedShips, newShip]);
        setSelectedShipType(null); // reset selection
    };

    return (
        <div>
            <h3>Select a Ship</h3>
            <ul>
                {requiredShips.map(ship => {
                    const alreadyPlaced = placedShips.some(s => s.type === ship.type);
                    return (
                        <li key={ship.type}>
                            <button
                                disabled={alreadyPlaced}
                                onClick={() => setSelectedShipType(ship.type)}
                            >
                                {ship.type} ({ship.size}) {alreadyPlaced ? "✅" : ""}
                            </button>
                        </li>
                    );
                })}
            </ul>

            <div>
                <h3>Click Grid to Place: {selectedShipType || "None selected"}</h3>
                <button onClick={() => setOrientation(o => o === "H" ? "V" : "H")}>
                    Orientation: {orientation}
                </button>

                <div className="grid-container">
                    <div className="row header">
                        <div className="cell corner" />
                        {numbers.map(n => (
                            <div key={n} className="cell header-cell">{n}</div>
                        ))}
                    </div>

                    {letters.map(letter => (
                        <div key={letter} className="row">
                            <div className="cell header-cell">{letter}</div>
                            {numbers.map(n => {
                                const coord = `${letter}${n}`;
                                const isShip = placedShips.some(s => s.locations.includes(coord));
                                return (
                                    <div
                                        key={coord}
                                        className={`cell ${isShip ? "ship-cell" : ""}`}
                                        onClick={() => handleCellClick(coord)}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>

                <button
                    onClick={postShips}
                    disabled={placedShips.length !== requiredShips.length}
                >
                    Submit Ships
                </button>
            </div>

        </div>
    );
}

