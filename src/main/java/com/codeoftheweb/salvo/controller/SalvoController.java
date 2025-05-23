package com.codeoftheweb.salvo.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;

@RestController
@RequestMapping("/games")
public class SalvoController {
    @Autowired
    private GameRepository gameRepository;
}
