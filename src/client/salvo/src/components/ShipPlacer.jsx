import React, { useState } from "react";

export const ShipPlacer = ({ gamePlayerId }) => {
    const [ships, setShips] = useState([
        { type: "destroyer", locations: ["A1", "B1", "C1"] },
        { type: "patrol boat", locations: ["H5", "H6"] },
    ]);

    const postShips = async () => {
        try {
            const response = await fetch(`/api/game/${gamePlayerId}/ships`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(ships),
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

    return (
        <div>
            <button onClick={postShips}>Post Ships</button>
        </div>
    );
}

