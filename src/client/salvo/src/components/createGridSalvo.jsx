import React from "react";

//Creating a separate grid for salvo strikes.
export const CreateGridSalvo = ({ playerShips = [] }) => {
    const letters = 'ABCDEFGHIJ'.split(''); //Create an array of letters A - J.
    const numbers = Array.from({ length: 10 }, (value, i) => i + 1); //Create an array of digits 1 - 10.
    const shipLocations = new Set(
        playerShips.flatMap(ship => ship.locations)
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

                        return (
                            <div
                                key={n}
                                className={`cell ${isShip ? 'ship-cell' : ''}`}
                            //if the cell contains a location it becomes a ship-cell which will be coloured and marked on the grid, with ship-cell styling.
                            ></div>
                        );
                    })}
                </div>
            ))}
        </div>
    )
};