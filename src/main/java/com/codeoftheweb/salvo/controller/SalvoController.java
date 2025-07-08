package com.codeoftheweb.salvo.controller;

import com.codeoftheweb.salvo.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api")
public class SalvoController {

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private GamePlayerRepository gamePlayerRepository;

    @Autowired
    private ShipRepository shipRepository;

    @Autowired
    private SalvoRepository salvoRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/game_view/{gpId}")
    public ResponseEntity<Map<String, Object>> getGameView(@PathVariable Long gpId, Authentication authentication) {
        Optional<GamePlayer> gamePlayerOpt = gamePlayerRepository.findById(gpId);

        if (gamePlayerOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "GamePlayer not found"));
        }

        GamePlayer gamePlayer = gamePlayerOpt.get();

        if (authentication == null || !gamePlayer.getPlayer().getEmail().equals(authentication.getName())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Unauthorized access to game view"));
        }

        return ResponseEntity.ok(gamePlayer.makeGameViewDTO());
    }

    @GetMapping("/current-player")
    public ResponseEntity<?> getCurrentPlayer(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not logged in"));
        }

        Player player = playerRepository.findByEmail(authentication.getName());
        if (player == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Player not found"));
        }

        return ResponseEntity.ok(Map.of("id", player.getId(), "email", player.getEmail()));
    }

    @GetMapping("/games")
    public Map<String, Object> getGames(Authentication authentication) {
        Map<String, Object> response = new LinkedHashMap<>();

        List<Map<String, Object>> games = gameRepository.findAll().stream().map(game -> {
            Map<String, Object> dto = new LinkedHashMap<>();
            dto.put("id", game.getId());
            dto.put("created", game.getCreatedDate());

            List<Map<String, Object>> gamePlayers = game.getGamePlayers().stream().map(gp -> {
                Map<String, Object> gpDto = new LinkedHashMap<>();
                gpDto.put("id", gp.getId());
                gpDto.put("player", Map.of("id", gp.getPlayer().getId(), "email", gp.getPlayer().getEmail()));
                return gpDto;
            }).collect(Collectors.toList());

            List<Map<String, Object>> scores = game.getScores() != null
                    ? game.getScores().stream().map(score -> {
                        Map<String, Object> scoreMap = new HashMap<>();
                        scoreMap.put("playerId", score.getPlayer().getId());
                        scoreMap.put("score", score.getScore());
                        return scoreMap;
                    }).collect(Collectors.toList())
                    : List.of();

            dto.put("gamePlayers", gamePlayers);
            dto.put("scores", scores);

            return dto;
        }).collect(Collectors.toList());

        response.put("games", games);
        return response;
    }

    @PostMapping("/games")
    public ResponseEntity<Map<String, Object>> createGame(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "You must be logged in to create a game"));
        }

        Player player = playerRepository.findByEmail(authentication.getName());
        if (player == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Player not found"));
        }

        Game newGame = new Game();
        gameRepository.save(newGame);

        GamePlayer newGamePlayer = new GamePlayer(newGame, player);
        gamePlayerRepository.save(newGamePlayer);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("gpid", newGamePlayer.getId()));
    }

    @GetMapping("/leaderboard")
    public List<Map<String, Object>> getLeaderboard() {
        return playerRepository.findAll().stream().map(player -> {
            Map<String, Object> dto = new HashMap<>();
            List<Score> scores = player.getScores() != null ? player.getScores() : List.of();

            double total = scores.stream().mapToDouble(Score::getScore).sum();
            long wins = scores.stream().filter(s -> s.getScore() == 1.0).count();
            long losses = scores.stream().filter(s -> s.getScore() == 0.0).count();
            long ties = scores.stream().filter(s -> s.getScore() == 0.5).count();

            dto.put("email", player.getEmail());
            dto.put("totalScore", total);
            dto.put("wins", wins);
            dto.put("losses", losses);
            dto.put("ties", ties);

            return dto;
        }).collect(Collectors.toList());
    }

    @PostMapping("/players")
    public ResponseEntity<Map<String, Object>> registerPlayer(@RequestParam String email,
            @RequestParam String password) {
        if (playerRepository.findByEmail(email) != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Email already in use"));
        }

        String encodedPassword = passwordEncoder.encode(password);
        Player newPlayer = new Player(email, encodedPassword);
        playerRepository.save(newPlayer);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "id", newPlayer.getId(),
                "email", newPlayer.getEmail(),
                "message", "Player registered successfully"));
    }

    @GetMapping("/players")
    public List<PlayerDTO> getPlayers() {
        return playerRepository.findAll().stream()
                .map(p -> new PlayerDTO(p.getId(), p.getEmail()))
                .collect(Collectors.toList());
    }

    @PostMapping("/game/{gameId}/players")
    public ResponseEntity<?> joinGame(@PathVariable Long gameId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
        }

        Player currentPlayer = playerRepository.findByEmail(authentication.getName());
        if (currentPlayer == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid user"));
        }

        Optional<Game> optionalGame = gameRepository.findById(gameId);
        if (optionalGame.isEmpty()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "No such game"));
        }

        Game game = optionalGame.get();
        if (game.getGamePlayers().size() >= 2) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Game is full"));
        }

        GamePlayer newGamePlayer = new GamePlayer(game, currentPlayer);
        gamePlayerRepository.save(newGamePlayer);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("gpid", newGamePlayer.getId()));
    }

    @PostMapping("/game/{gamePlayerId}/ships")
    public ResponseEntity<?> addShips(@PathVariable Long gamePlayerId,
            @RequestBody List<ShipDTO> shipDTOs,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "You must be logged in"));
        }

        Player currentPlayer = playerRepository.findByEmail(authentication.getName());
        if (currentPlayer == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid user"));
        }

        Optional<GamePlayer> optionalGamePlayer = gamePlayerRepository.findById(gamePlayerId);
        if (optionalGamePlayer.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized access to game"));
        }

        GamePlayer gamePlayer = optionalGamePlayer.get();
        if (!gamePlayer.getPlayer().getId().equals(currentPlayer.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Unauthorized access to game"));
        }

        if (!gamePlayer.getShips().isEmpty()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Ships already placed"));
        }

        for (ShipDTO dto : shipDTOs) {
            Ship ship = new Ship();
            ship.setType(dto.getType());
            ship.setLocation(dto.getLocations());
            ship.setGamePlayer(gamePlayer);
            shipRepository.save(ship);
        }

        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/games/players/{gamePlayerId}/salvos")
    public ResponseEntity<Object> addSalvo(@PathVariable Long gamePlayerId,
            @RequestBody Salvo salvo,
            Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized access to game"));
        }

        Player player = playerRepository.findByEmail(authentication.getName());
        Optional<GamePlayer> optionalGamePlayer = gamePlayerRepository.findById(gamePlayerId);

        if (optionalGamePlayer.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized access to game"));
        }

        GamePlayer gamePlayer = optionalGamePlayer.get();
        if (!gamePlayer.getPlayer().equals(player)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "User does not own this game player"));
        }

        // Calculate the next turn count
        int nextTurn = gamePlayer.getSalvoes().size() + 1;

        // Check if the incoming salvo has a turnCount, ignore it and set server-side
        salvo.setTurnCount(nextTurn);

        // Optional: double check if salvo for this turn already exists
        boolean turnExists = gamePlayer.getSalvoes().stream()
                .anyMatch(s -> s.getTurnCount() == salvo.getTurnCount());

        if (turnExists) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Salvo for this turn already exists"));
        }

        salvo.setGamePlayer(gamePlayer);
        salvoRepository.save(salvo);

        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

}
