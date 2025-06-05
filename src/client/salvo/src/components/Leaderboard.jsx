import React, { useEffect, useState } from "react"
import '../index.css';

export const Leaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]); // Initialize empty array.

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/leaderboard');
                const data = await response.json(); // Fetching data from leaderboard API.
                setLeaderboard(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="leaderboard-container">
            <h1>Leaderboard</h1>
            <table className="leaderboard-table">
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>Total Score</th>
                        <th>Wins</th>
                        <th>Losses</th>
                        <th>Ties</th>
                    </tr>
                </thead>
                <tbody>
                    {leaderboard.map(player => ( //maps through leaderboard and creates a row for each player with table cells with win/lose/tie count.
                        <tr key={player.playerId}>
                            <td>{player.email}</td>
                            <td>{player.totalScore}</td>
                            <td>{player.wins}</td>
                            <td>{player.losses}</td>
                            <td>{player.ties}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};