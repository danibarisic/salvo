package com.codeoftheweb.salvo.controller;

import com.codeoftheweb.salvo.GameRepository;
import com.codeoftheweb.salvo.PlayerRepository;
import com.codeoftheweb.salvo.Score;
import com.codeoftheweb.salvo.Player;
import com.codeoftheweb.salvo.Game;
import com.codeoftheweb.salvo.GamePlayer;
import com.codeoftheweb.salvo.GamePlayerRepository;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.stream.Collectors;
import java.util.LinkedHashMap;
import java.util.Optional;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api") // Set the root as /api.
public class SalvoController {

    // Linking all the required repositories.
    @Autowired
    private GameRepository gameRepository;
    @Autowired
    private PlayerRepository playerRepository;
    @Autowired
    private GamePlayerRepository gamePlayerRepository;

    @GetMapping("/game_view/{gpId}")
    public ResponseEntity<Map<String, Object>> getGameView(@PathVariable Long gpId) {
        Optional<GamePlayer> gamePlayerOpt = gamePlayerRepository.findById(gpId); // Optional acts as a safety in case
                                                                                  // there is no gamePlayer found.

        if (!gamePlayerOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "GamePlayer not found")); // If no gamePlayer then an error message is created
                                                                    // as JSON.
        }

        GamePlayer gamePlayer = gamePlayerOpt.get(); // If there is a gamePlayer, then it is retrieved via Optional.
        Game game = gamePlayer.getGame();

        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("gameId", game.getId());
        dto.put("created", game.getCreatedDate());

        // Map gamePlayers
        List<Map<String, Object>> gamePlayers = game.getGamePlayers().stream()
                .map(gp -> {
                    Map<String, Object> gamePlayerDto = new LinkedHashMap<>();
                    gamePlayerDto.put("id", gp.getId());

                    Player player = gp.getPlayer();
                    Map<String, Object> playerDto = new LinkedHashMap<>();
                    playerDto.put("id", player.getId());
                    playerDto.put("email", player.getEmail());

                    gamePlayerDto.put("player", playerDto);
                    gamePlayerDto.put("score", gp.getScore() != null ? gp.getScore().getScore() : null);

                    return gamePlayerDto;
                })
                .collect(Collectors.toList());

        dto.put("gamePlayers", gamePlayers);
        // Create a List of Maps for scores, as long as scores from Game Entity is not
        // null.
        List<Map<String, Object>> scores = (game.getScores() != null) ? game.getScores().stream()
                .map(score -> {
                    Map<String, Object> scoreDto = new LinkedHashMap<>();
                    scoreDto.put("playerId", score.getPlayer().getId());
                    scoreDto.put("score", score.getScore());
                    return scoreDto;
                })
                .collect(Collectors.toList())
                : List.of(); // If scores = null than an empty list is returned.

        dto.put("scores", scores);

        // Create a List of Maps for ships.
        List<Map<String, Object>> ships = gamePlayer.getShips().stream()
                .map(ship -> {
                    Map<String, Object> shipDto = new LinkedHashMap<>();
                    shipDto.put("type", ship.getType());
                    shipDto.put("locations", ship.getLocation());
                    shipDto.put("ownerId", ship.getGamePlayer().getId());
                    return shipDto;
                })
                .collect(Collectors.toList());

        dto.put("ships", ships);

        // Creates a List of Maps for salvoes.
        List<Map<String, Object>> salvoes = game.getGamePlayers().stream()
                .flatMap(gp -> gp.getSalvoes().stream())
                .map(salvo -> {
                    Map<String, Object> salvoDto = new LinkedHashMap<>();
                    salvoDto.put("gamePlayer", salvo.getGamePlayer().getId());
                    salvoDto.put("turn", salvo.getTurnCount());
                    salvoDto.put("locations", salvo.getLocation());
                    return salvoDto;
                })
                .collect(Collectors.toList());

        dto.put("salvoes", salvoes);

        return ResponseEntity.ok(dto);
    }

    @GetMapping("/games")
    public List<Map<String, Object>> getGames() {
        // Create list of all games from the gameRepository.
        return gameRepository
                .findAll()
                .stream()
                .map(game -> {
                    // Creating a map called dto with key object pairs.
                    Map<String, Object> dto = new LinkedHashMap<>();
                    dto.put("id", game.getId());
                    dto.put("created", game.getCreatedDate());

                    // Creates a List of maps, and containes another nested map for players.
                    List<Map<String, Object>> gamePlayers = game.getGamePlayers()
                            .stream()
                            .map(gamePlayer -> {
                                Map<String, Object> gamePlayerDto = new LinkedHashMap<>();
                                gamePlayerDto.put("id", gamePlayer.getId());

                                Map<String, Object> playerDto = new LinkedHashMap<>();
                                Player player = gamePlayer.getPlayer();
                                playerDto.put("id", player.getId());
                                playerDto.put("email", player.getEmail());

                                gamePlayerDto.put("player", playerDto);
                                return gamePlayerDto;
                            })
                            .collect(Collectors.toList());

                    dto.put("gamePlayers", gamePlayers);

                    // If Scores from Game Entity isn't null, then it will create a stream and map
                    // the appropriate keys and objects as scoreDto.
                    List<Map<String, Object>> scores = (game.getScores() != null) ? game.getScores().stream()
                            .map(score -> {
                                Map<String, Object> scoreDto = new LinkedHashMap<>();
                                scoreDto.put("playerId", score.getPlayer().getId());
                                scoreDto.put("score", score.getScore());
                                return scoreDto;
                            })
                            .collect(Collectors.toList())
                            : List.of();// if null will return empty list.

                    dto.put("scores", scores);

                    return dto;
                })
                .collect(Collectors.toList());
    }

    @GetMapping("/leaderboard")
    public List<Map<String, Object>> getLeaderboard() {
        List<Player> players = playerRepository.findAll(); // Create a list of all the players from the
                                                           // playerRepository.

        return players.stream().map(player -> {
            Map<String, Object> dto = new LinkedHashMap<>(); // Map through players and create keys and objects as DTO.
            dto.put("email", player.getEmail());

            List<Score> scores = player.getScores();
            double total = scores.stream().mapToDouble(Score::getScore).sum();

            // if the variables contains number, increment by 1
            long wins = scores.stream().filter(s -> s.getScore() == 1.0).count();
            long losses = scores.stream().filter(s -> s.getScore() == 0.0).count();
            long ties = scores.stream().filter(s -> s.getScore() == 0.5).count();

            // Add everything to the JSON
            dto.put("totalScore", total);
            dto.put("wins", wins);
            dto.put("losses", losses);
            dto.put("ties", ties);

            return dto;
        }).collect(Collectors.toList());
    }

}
