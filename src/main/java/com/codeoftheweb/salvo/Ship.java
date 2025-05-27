package com.codeoftheweb.salvo;

import jakarta.persistence.ElementCollection;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GenerationType;
import java.util.HashSet;
import java.util.Set;

@Entity
public class Ship {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ElementCollection
    @CollectionTable()
    @Column(name = "location")
    private Set<String> location;
    private String type;

    @ManyToMany
    private Set<GamePlayer> gamePlayers = new HashSet<>();

    public Ship(Long id, Set<String> location, String type) {
        this.id = id;
        this.location = location;
        this.type = type;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Set<String> getLocation() {
        return location;
    }

    public void setLocation(Set<String> location) {
        this.location = location;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

}
