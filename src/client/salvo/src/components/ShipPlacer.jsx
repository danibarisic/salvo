import React, { useState } from "react";
import "../index.css"; // Adjust path if needed

export const ShipPlacer = ({ gamePlayerId, setPlayerShips }) => {
    const requiredShips = [
        { type: "submarine", size: 3 },
        { type: "destroyer", size: 3 },
        { type: "patrol boat", size: 2 },
    ];

    const [placedShips, setPlacedShips] = useState([]);
    const [selectedShipType, setSelectedShipType] = useState(null);
    const [orientation, setOrientation] = useState("H");

    const letters = "ABCDEFGHIJ".split("");
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    const getShipLocations = (start, size, orientation) => {

        const [rowLetter, ...numPart] = start;
        const rowIndex = letters.indexOf(rowLetter.toUpperCase());
        const columnIndex = parseInt(numPart.join("")) - 1;

        const locations = [];

        for (let i = 0; i < size; i++) {
            const row = orientation === "V" ? rowIndex + i : rowIndex;
            const column = orientation === "H" ? columnIndex + i : columnIndex;

            if (row > 9 || column > 9 || row < 0 || column < 0) return null;
            locations.push(`${letters[row]}${column + 1}`);
        }

        return locations;
    };

    const isOverlapping = (locations) => {
        const allOccupied = placedShips.flatMap((ship) => ship.locations);
        return locations.some((location) => allOccupied.includes(location));
    };

    const handleCellClick = (cellId) => {
        const existingShip = placedShips.find((ship) =>
            ship.locations.includes(cellId)
        );

        if (existingShip) {
            setPlacedShips(placedShips.filter((ship) => ship !== existingShip));
            return;
        }

        if (!selectedShipType) {
            alert("Please select a ship type first.");
            return;
        }

        const shipSize = requiredShips.find((ship) => ship.type === selectedShipType).size;
        const locations = getShipLocations(cellId, shipSize, orientation);

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
        setSelectedShipType(null);
    };

    const submitShips = async () => {
        if (placedShips.length !== requiredShips.length) {
            alert("Please place all required ships before submitting.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/game/${gamePlayerId}/ships`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(placedShips),
                credentials: "include", // if needed for auth
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(`Error submitting ships: ${errorData.message || response.statusText}`);
                return;
            }

            alert("Ships submitted successfully!");
            setPlayerShips(placedShips);
            // Optionally redirect or update state
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to submit ships. Please try again.");
        }
    };

    return (
        <div>
            <h3>Select a Ship to Place</h3>

            <div className="ship-buttons">
                {requiredShips.map((ship) => {
                    const alreadyPlaced = placedShips.some((s) => s.type === ship.type);
                    return (
                        <button
                            key={ship.type}
                            disabled={alreadyPlaced}
                            onClick={() => setSelectedShipType(ship.type)}
                            className={`ship-button ${selectedShipType === ship.type ? "selected" : ""
                                }`}
                            title={alreadyPlaced ? "Ship already placed" : `Place your ${ship.type}`}
                        >
                            {ship.type} ({ship.size}) {alreadyPlaced ? "✅" : ""}
                        </button>
                    );
                })}
            </div>

            <div className="orientation-toggle">
                <span>Orientation: </span>
                <button
                    onClick={() => setOrientation(orientation === "H" ? "V" : "H")}
                >
                    {orientation === "H" ? "Horizontal" : "Vertical"}
                </button>
            </div>

            <div className="grid-container">
                <div className="row">
                    <div className="cell corner"></div>
                    {numbers.map((num) => (
                        <div key={`col-${num}`} className="cell header-cell">
                            {num}
                        </div>
                    ))}
                </div>

                {letters.map((letter) => (
                    <div key={`row-${letter}`} className="row">
                        <div className="cell header-cell">{letter}</div>
                        {numbers.map((num) => {
                            const cellId = `${letter}${num}`;
                            const isShipCell = placedShips.some((ship) =>
                                ship.locations.includes(cellId)
                            );

                            return (
                                <div
                                    key={cellId}
                                    className={`cell ${isShipCell ? "ship-cell" : ""}`}
                                    onClick={() => handleCellClick(cellId)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            handleCellClick(cellId);
                                        }
                                    }}
                                    aria-label={`Cell ${cellId}`}
                                ></div>
                            );
                        })}
                    </div>
                ))}
            </div>

            <button
                onClick={submitShips}
                className="submit-button"
                disabled={placedShips.length !== requiredShips.length}>
                Submit Ships
            </button>
        </div>
    );
};
