package com.codeoftheweb.salvo;

import jakarta.persistence.ElementCollection;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GenerationType;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
public class Ship {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ElementCollection
    @CollectionTable(name = "ship_location")
    @Column(name = "location")
    private List<String> location;
    private String type;

    @ManyToOne
    @JoinColumn(name = "game_id")
    @JsonBackReference
    private Game game;

    @OneToMany(mappedBy = "ship")
    private Player gamePlayers;

    public Ship() {

    }

    public Ship(String type, List<String> location) {
        this.type = type;
        this.location = location;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Game getGame() {
        return game;
    }

    public void setGame(Game game) {
        this.game = game;
    }

    public Player getGamePlayers() {
        return gamePlayers;
    }

    public void setGamePlayers(Player gamePlayers) {
        this.gamePlayers = gamePlayers;
    }

    public List<String> getLocation() {
        return location;
    }

    public void setLocation(List<String> location) {
        this.location = location;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

}
