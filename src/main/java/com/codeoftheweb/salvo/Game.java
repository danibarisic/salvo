package com.codeoftheweb.salvo;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Game {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private Number date;

    public Game() {
        public Game

        this.name = name;
        this.date = date;
        
    
