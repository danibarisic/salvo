package com.codeoftheweb;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.codeoftheweb.salvo.Player;
import com.codeoftheweb.salvo.PlayerRepository;

@Service
public class PlayerService {
    private final PlayerRepository playerRepository;
    private final PasswordEncoder passwordEncoder;

    public PlayerService(PlayerRepository playerRepository, PasswordEncoder passwordEncoder) {
        this.playerRepository = playerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Player registerPlayer(Player player) {
        player.setPassword(passwordEncoder.encode(player.getPassword()));
        return playerRepository.save(player);
    }
}
