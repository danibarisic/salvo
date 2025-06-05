import React from "react";

//Creating a separate grid for salvo strikes.
export const CreateGridSalvo = ({ playerSalvoes = [] }) => {
    const letters = 'ABCDEFGHIJ'.split(''); //Create an array of letters A - J.
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; //Create an array of digits 1 - 10.
    const salvoLocations = new Set(
        playerSalvoes.flatMap(salvo => salvo.locations)
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
                        const isSalvo = salvoLocations.has(coord);

                        return (
                            <div
                                key={n}
                                className={`cell ${isSalvo ? 'salvo-cell' : ''}`}
                            //if the cell contains a location it becomes a ship-cell which will be coloured and marked on the grid, with ship-cell styling.
                            ></div>
                        );
                    })}
                </div>
            ))}
        </div>
    )
};