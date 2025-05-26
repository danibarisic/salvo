package com.codeoftheweb.salvo;

import java.time.LocalDateTime;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.beans.factory.annotation.Autowired;

@SpringBootApplication
public class SalvoApplication implements CommandLineRunner {
	@Autowired
	private PlayerRepository playerRepository;

	@Autowired
	private GameRepository gameRepository;
	@Autowired
	private GamePlayerRepository gamePlayerRepository;

	public static void main(String[] args) {
		SpringApplication.run(SalvoApplication.class, args);
	}

	@Override
	public void run(String... args) throws Exception {
		Player jack = new Player("Jack Bauer", "j.bauer@ctu.gov");
		Player chloe = new Player("Chloe O'Brian", "c.obrian@ctu.gov");
		Player kim = new Player("Kim Bauer", "kim_bauer@gmail.com");
		Player tony = new Player("Tony Almeida", "t.almeida@ctu.gov");

		playerRepository.save(jack);
		playerRepository.save(chloe);
		playerRepository.save(kim);
		playerRepository.save(tony);

		Game game1 = gameRepository.save(new Game("Game 1", LocalDateTime.now()));
		Game game2 = gameRepository.save(new Game("Game 2", LocalDateTime.now().plusHours(1)));
		Game game3 = gameRepository.save(new Game("Game 3", LocalDateTime.now().plusHours(2)));
		Game game4 = gameRepository.save(new Game("Game 4", LocalDateTime.now().plusHours(3)));

		gamePlayerRepository.save(new GamePlayer(game1, jack));
		gamePlayerRepository.save(new GamePlayer(game2, chloe));
		gamePlayerRepository.save(new GamePlayer(game1, kim));
		gamePlayerRepository.save(new GamePlayer(game2, tony));
		gamePlayerRepository.save(new GamePlayer(game3, jack));
		gamePlayerRepository.save(new GamePlayer(game4, chloe));
		gamePlayerRepository.save(new GamePlayer(game3, kim));
		gamePlayerRepository.save(new GamePlayer(game4, tony));
	}
}
