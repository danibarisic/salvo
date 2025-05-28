const gameListGenerator = async () => {
    try {
        const response = await fetch("http://localhost:8080/api/games");
        const data = await response.json();
        const games = data;

        const list = document.getElementById("orderedList");
        list.innerHTML = "";

        games.forEach(game => {
            const li = document.createElement("li");
            const createdDate = new Date(game.created).toLocaleString();
            const players = game.gamePlayers
                .map(gp => gp.player.email)
                .join(" vs. ");

            li.textContent = `Game at ${createdDate} -  Players: ${players}`;

            list.appendChild(li);
        });
    } catch (error) {
        console.error("Failed to load games:", error);
    }

};

window.onload = gameListGenerator;