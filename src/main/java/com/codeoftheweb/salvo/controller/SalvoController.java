package com.codeoftheweb.salvo.controller;

import com.codeoftheweb.salvo.GameRepository;
import com.codeoftheweb.salvo.Player;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
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
    private GameRepository gameRepository;

    @GetMapping("/games")
    public List<Map<String, Object>> getGames() {
        return gameRepository
                .findAll()
                .stream()
                .map(game -> {
                    Map<String, Object> dto = new LinkedHashMap<>();
                    dto.put("id", game.getId());
                    dto.put("ships", game.getShips());
                    dto.put("created", game.getCreatedDate());

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
