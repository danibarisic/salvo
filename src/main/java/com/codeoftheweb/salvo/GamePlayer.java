package com.codeoftheweb.salvo;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;

import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.Comparator;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.time.LocalDateTime;

@Entity
public class GamePlayer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "player_id")
    private Player player;

    @ManyToOne
    @JoinColumn(name = "game_id")
    private Game game;
    private LocalDateTime dateAdded;

    @OneToMany(mappedBy = "gamePlayer", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<Ship> ships = new ArrayList<>();

    @OneToMany(mappedBy = "gamePlayer", cascade = CascadeType.ALL)
    private List<Salvo> salvoes = new ArrayList<>();

    @OneToOne(mappedBy = "gamePlayer", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private Score score;

    public GamePlayer() {
    }

    public GamePlayer(Game game, Player player) {
        this.game = game;
        this.player = player;
        this.dateAdded = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public List<Ship> getShips() {
        return ships;
    }

    public void setShips(List<Ship> ships) {
        this.ships = ships;
    }

    public Player getPlayer() {
        return player;
    }

    public void setPlayer(Player player) {
        this.player = player;
    }

    public LocalDateTime getDateAdded() {
        return dateAdded;
    }

    public void setDateAdded(LocalDateTime dateAdded) {
        this.dateAdded = dateAdded;
    }

    public Game getGame() {
        return game;
    }

    public void setGame(Game game) {
        this.game = game;
    }

    public List<Salvo> getSalvoes() {
        return salvoes;
    }

    public void setSalvoes(List<Salvo> salvoes) {
        this.salvoes = salvoes;
    }

    public Score getScore() {
        return score;
    }

    public void setScore(Score score) {
        this.score = score;
    }

    public Map<String, Object> makeGamePlayerDTO() {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", this.getId());
        dto.put("player", Map.of(
                "id", this.getPlayer().getId(),
                "email", this.getPlayer().getEmail()));
        dto.put("score", this.getScore() != null ? this.getScore().getScore() : null);
        return dto;
    }

    public Map<String, Object> makeGameViewDTO() {
        Map<String, Object> dto = new LinkedHashMap<>();

        dto.put("gameId", this.getGame().getId());
        dto.put("created", this.getGame().getCreatedDate());

        dto.put("gamePlayers", this.getGame().getGamePlayers()
                .stream()
                .map(GamePlayer::makeGamePlayerDTO)
                .collect(Collectors.toList()));

        dto.put("ships", this.getGame().getGamePlayers()
                .stream()
                .flatMap(gp -> gp.getShips().stream())
                .map(ship -> Map.of(
                        "type", ship.getType(),
                        "locations", ship.getLocation(),
                        "ownerId", ship.getGamePlayer().getId()))
                .collect(Collectors.toList()));

        dto.put("salvoes", this.getGame().getGamePlayers()
                .stream()
                .flatMap(gp -> gp.getSalvoes().stream())
                .map(salvo -> Map.of(
                        "gamePlayer", salvo.getGamePlayer().getId(),
                        "turn", salvo.getTurnCount(),
                        "locations", salvo.getLocation()))
                .collect(Collectors.toList()));

        dto.put("gameState", determineGameState());

        // Add ships left count for both players
        Optional<GamePlayer> opponentOpt = getOpponent();
        dto.put("shipsLeft", Map.of(
                "player", countShipsLeft(this),
                "opponent", opponentOpt.map(this::countShipsLeft).orElse(0)));
        dto.put("hitHistory", buildHitHistory());

        return dto;
    }

    private Optional<GamePlayer> getOpponent() {
        return this.getGame().getGamePlayers()
                .stream()
                .filter(gp -> !gp.getId().equals(this.getId()))
                .findFirst();
    }

    private String determineGameState() {
        Optional<GamePlayer> opponentOpt = getOpponent();

        if (this.getShips().isEmpty()) {
            return "place-ships";
        }

        // If opponent hasn't joined OR opponent has joined but hasn't placed ships
        if (opponentOpt.isEmpty() || opponentOpt.get().getShips().isEmpty()) {
            return "wait";
        }

        GamePlayer opponent = opponentOpt.get();

        // 2. Check for game-over conditions
        boolean currentPlayerShipsSunk = allShipsSunk(this);
        boolean opponentPlayerShipsSunk = allShipsSunk(opponent);

        // If both players' ships are sunk, it's a tie
        if (currentPlayerShipsSunk && opponentPlayerShipsSunk) {
            return "game-over-tied";
        }
        // If only current player's ships are sunk, current player lost
        if (currentPlayerShipsSunk) {
            return "game-over-lost";
        }
        // If only opponent's ships are sunk, current player won
        if (opponentPlayerShipsSunk) {
            return "game-over-won";
        }

        // 3. If game is not over, determine whose turn it is
        int playerTurns = this.getSalvoes().size();
        int opponentTurns = opponent.getSalvoes().size();

        if (playerTurns <= opponentTurns) {
            return "enter-salvo";
        } else {
            return "wait";
        }
    }

    private int countShipsLeft(GamePlayer gp) {
        if (gp == null)
            return 0;
        // Count ships that are NOT sunk
        long shipsAfloatCount = gp.getShips()
                .stream()
                .filter(ship -> !isSunk(ship, gp))
                .count();
        return (int) shipsAfloatCount;
    }

    private boolean isSunk(Ship ship, GamePlayer shipOwner) {
        Optional<GamePlayer> opponentOpt = shipOwner.getOpponent();
        if (opponentOpt.isEmpty()) {
            return false;
        }
        GamePlayer firingOpponent = opponentOpt.get();

        // Collect all salvo locations fired by the opponent
        Set<String> opponentSalvoLocations = firingOpponent.getSalvoes()
                .stream()
                .flatMap(salvo -> salvo.getLocation().stream())
                .collect(Collectors.toSet());

        // A ship is sunk if ALL its locations are present in the opponent's salvo
        // locations
        return opponentSalvoLocations.containsAll(ship.getLocation());
    }

    private boolean allShipsSunk(GamePlayer gp) {
        return gp.getShips().stream().allMatch(ship -> isSunk(ship, gp));
    }

    public List<Map<String, Object>> buildHitHistory() {
        List<Map<String, Object>> hitHistory = new ArrayList<>();

        Optional<GamePlayer> opponentOpt = getOpponent();
        if (opponentOpt.isEmpty())
            return hitHistory;
        GamePlayer opponent = opponentOpt.get();

        // Get this player's ship locations (because opponent salvos hit *this* player's
        // ships)
        List<String> myShipLocations = this.getShips()
                .stream()
                .flatMap(ship -> ship.getLocation().stream())
                .collect(Collectors.toList());

        // Combine all salvos from opponent
        List<Salvo> opponentSalvos = opponent.getSalvoes()
                .stream()
                .sorted(Comparator.comparingInt(Salvo::getTurnCount))
                .collect(Collectors.toList());

        Set<String> allHitsSoFar = new HashSet<>();
        Set<String> sunkShipTypesSoFar = new HashSet<>();

        for (Salvo salvo : opponentSalvos) {
            Map<String, Object> turnReport = new LinkedHashMap<>();
            List<String> salvoLocations = salvo.getLocation();

            List<String> turnHits = salvoLocations
                    .stream()
                    .filter(myShipLocations::contains)
                    .collect(Collectors.toList());

            allHitsSoFar.addAll(turnHits);

            // Filter to only include types that were not already marked as sunk.
            List<String> newlySunkShipsThisTurn = this.getShips()
                    .stream()
                    .filter(ship -> allHitsSoFar.containsAll(ship.getLocation())) // Check if this ship is now sunk
                    .map(Ship::getType)
                    .filter(type -> !sunkShipTypesSoFar.contains(type))
                    .collect(Collectors.toList());

            sunkShipTypesSoFar.addAll(newlySunkShipsThisTurn); // Add newly sunk ship types to cumulative set

            turnReport.put("turn", salvo.getTurnCount());
            turnReport.put("hitsThisTurn", turnHits.isEmpty() ? List.of() : turnHits);
            turnReport.put("sunkShips", newlySunkShipsThisTurn.isEmpty() ? List.of() : newlySunkShipsThisTurn);

            List<String> cumulativeHits = new ArrayList<>(allHitsSoFar);
            cumulativeHits.sort(null);
            turnReport.put("cumulativeHits", cumulativeHits);

            hitHistory.add(turnReport);
        }

        return hitHistory;
    }
}