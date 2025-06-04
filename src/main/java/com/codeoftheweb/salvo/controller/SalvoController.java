package com.codeoftheweb.salvo.controller;

import com.codeoftheweb.salvo.GameRepository;
import com.codeoftheweb.salvo.Player;
import com.codeoftheweb.salvo.Game;
import com.codeoftheweb.salvo.GamePlayer;
import com.codeoftheweb.salvo.GamePlayerRepository;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.stream.Collectors;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api")
public class SalvoController {

    @Autowired
    private GameRepository gameRepository; // Link game repo.
    @Autowired
    private GamePlayerRepository gamePlayerRepository; // Link gamePlayer repo.

    @GetMapping("/game_view/{gpId}")
    public Map<String, Object> getGameView(@PathVariable Long gpId) {

        GamePlayer gamePlayer = gamePlayerRepository.findById(gpId).orElseThrow();
        Game game = gamePlayer.getGame();
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("gameId", game.getId());
        dto.put("created", game.getCreatedDate());

        // Map gamePlayers.
        List<Map<String, Object>> gamePlayers = game.getGamePlayers().stream()
                .map(gp -> {
                    Map<String, Object> gamePlayerDto = new LinkedHashMap<>();
                    gamePlayerDto.put("id", gp.getId());

                    Player player = gp.getPlayer();
                    Map<String, Object> playerDto = new LinkedHashMap<>();
                    playerDto.put("id", player.getId());
                    playerDto.put("email", player.getEmail());

                    gamePlayerDto.put("player", playerDto);
                    return gamePlayerDto;
                })
                .collect(Collectors.toList());

        dto.put("gamePlayers", gamePlayers);

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

        List<Map<String, Object>> salvoes = gamePlayer.getSalvoes().stream()
                .map(salvo -> {
                    Map<String, Object> salvoDto = new LinkedHashMap<>();
                    salvoDto.put("gamePlayer", salvo.getGamePlayer().getId());
                    salvoDto.put("turn", salvo.getTurnCount());
                    salvoDto.put("locations", salvo.getLocation());
                    return salvoDto;
                })
                .collect(Collectors.toList());
        dto.put("salvoes", salvoes);
        return dto;
    }

    @GetMapping("/games")
    public List<Map<String, Object>> getGames() {
        return gameRepository
                .findAll()
                .stream()
                .map(game -> {
                    Map<String, Object> dto = new LinkedHashMap<>();
                    dto.put("id", game.getId()); // add id key
                    dto.put("created", game.getCreatedDate()); // add created key

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
                    return dto;
                })
                .collect(Collectors.toList());
    }

}
