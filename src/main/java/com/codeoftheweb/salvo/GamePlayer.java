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

        dto.put("ships", this.getShips()
                .stream()
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

        if (opponentOpt.isEmpty() || opponentOpt.get().getShips().isEmpty()) {
            return "wait";
        }

        GamePlayer opponent = opponentOpt.get();

        if (allShipsSunk(this)) {
            return "game-over-lost";
        }

        if (allShipsSunk(opponent)) {
            return "game-over-won";
        }

        if (allShipsSunk(this) && allShipsSunk(opponent)) {
            return "game-over-tied";
        }

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
        int totalShips = gp.getShips().size();
        long sunkCount = gp.getShips()
                .stream()
                .filter(this::isSunk)
                .count();
        return totalShips - (int) sunkCount;
    }

    private boolean isSunk(Ship ship) {
        // A ship is sunk if all its locations have been hit by opponent salvos
        Optional<GamePlayer> opponentOpt = getOpponent();
        if (opponentOpt.isEmpty())
            return false;
        GamePlayer opponent = opponentOpt.get();

        Set<String> opponentHits = opponent.getSalvoes()
                .stream()
                .flatMap(salvo -> salvo.getLocation().stream())
                .collect(Collectors.toSet());

        return opponentHits.containsAll(ship.getLocation());
    }

    private boolean allShipsSunk(GamePlayer gp) {
        return gp.getShips().stream().allMatch(this::isSunk);
    }

    public List<Map<String, Object>> buildHitHistory() {
        List<Map<String, Object>> hitHistory = new ArrayList<>();

        Optional<GamePlayer> opponentOpt = getOpponent();
        if (opponentOpt.isEmpty())
            return hitHistory;
        GamePlayer opponent = opponentOpt.get();

        List<String> opponentShipLocations = opponent.getShips()
                .stream()
                .flatMap(ship -> ship.getLocation().stream())
                .collect(Collectors.toList());

        // Combine all salvos from opponent (which target this player)
        List<Salvo> opponentSalvos = opponent.getSalvoes()
                .stream()
                .sorted(Comparator.comparingInt(Salvo::getTurnCount))
                .collect(Collectors.toList());

        Set<String> allHitsSoFar = new HashSet<>();
        Set<String> sunkShipsSoFar = new HashSet<>();

        for (Salvo salvo : opponentSalvos) {
            Map<String, Object> turnReport = new LinkedHashMap<>();
            List<String> salvoLocations = salvo.getLocation();

            List<String> turnHits = salvoLocations
                    .stream()
                    .filter(opponentShipLocations::contains)
                    .collect(Collectors.toList());

            allHitsSoFar.addAll(turnHits);

            // Identify sunk ships this turn
            List<String> sunkShipsThisTurn = opponent.getShips()
                    .stream()
                    .filter(ship -> allHitsSoFar.containsAll(ship.getLocation()))
                    .map(Ship::getType)
                    .filter(type -> !sunkShipsSoFar.contains(type))
                    .collect(Collectors.toList());

            sunkShipsSoFar.addAll(sunkShipsThisTurn);

            turnReport.put("turn", salvo.getTurnCount());
            turnReport.put("hitsThisTurn", turnHits.isEmpty() ? List.of("None") : turnHits);
            turnReport.put("sunkShips", sunkShipsThisTurn.isEmpty() ? List.of("None") : sunkShipsThisTurn);

            List<String> cumulativeHits = new ArrayList<>(allHitsSoFar);
            cumulativeHits.sort(null);
            turnReport.put("cumulativeHits", cumulativeHits);

            hitHistory.add(turnReport);
        }

        return hitHistory;
    }
}