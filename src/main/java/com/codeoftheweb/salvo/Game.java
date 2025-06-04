package com.codeoftheweb.salvo;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;

import java.time.LocalDateTime;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;

import java.util.HashSet;
import java.util.Set;

@Entity
public class Game {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private LocalDateTime createdDate;

    @ManyToMany(mappedBy = "games")
    private Set<Player> players = new HashSet<>();

    @OneToMany(mappedBy = "game")
    private Set<GamePlayer> gamePlayers = new HashSet<>();

    @OneToOne
    @JoinColumn(name = "score_id")
    private Score score;

    public Set<GamePlayer> getGamePlayers() {
        return gamePlayers;
    }

    public Game() {
    }

    public Game(String name, LocalDateTime createdDate) {
        this.name = name;
        this.createdDate = createdDate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }
}