const playerListGenerator = async () => {
    try {
        const response = await fetch("http://localhost:8080/api/games");
        const data = await response.json();
        const games = data;

        const list = document.getElementById("orderedList");
        list.innerHTML = "";

        games.forEach(game => {
            const li = document.createElement("li");
            li.textContent = game;
            list.appendChild(li);
        });
    } catch (error) {
        console.error("Failed to load games:", error);
    }

};

window.onload = playerListGenerator;