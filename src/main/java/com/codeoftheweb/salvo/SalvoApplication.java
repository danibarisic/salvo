package com.codeoftheweb.salvo;

import java.time.LocalDateTime;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import com.codeoftheweb.salvo.controller.SalvoController;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.Arrays;

@SpringBootApplication
public class SalvoApplication implements CommandLineRunner {

	private final SalvoController salvoController;
	@Autowired
	private PlayerRepository playerRepository;

	@Autowired
	private GameRepository gameRepository;
	@Autowired
	private GamePlayerRepository gamePlayerRepository;
	@Autowired
	private ShipRepository shipRepository;

	SalvoApplication(SalvoController salvoController) {
		this.salvoController = salvoController;
	}

	public static void main(String[] args) {
		SpringApplication.run(SalvoApplication.class, args);
	}

	@Override
	public void run(String... args) throws Exception {
		// Creating the 4 players.
		Player jack = new Player("Jack Bauer", "j.bauer@ctu.gov");
		Player chloe = new Player("Chloe O'Brian", "c.obrian@ctu.gov");
		Player kim = new Player("Kim Bauer", "kim_bauer@gmail.com");
		Player tony = new Player("Tony Almeida", "t.almeida@ctu.gov");

		// ...And saving them to the repo.
		playerRepository.save(jack);
		playerRepository.save(chloe);
		playerRepository.save(kim);
		playerRepository.save(tony);

		// Creating 4 individual games with one hour time separation.
		Game game1 = gameRepository.save(new Game("Game 1", LocalDateTime.now()));
		Game game2 = gameRepository.save(new Game("Game 2", LocalDateTime.now().plusHours(1)));
		Game game3 = gameRepository.save(new Game("Game 3", LocalDateTime.now().plusHours(2)));
		Game game4 = gameRepository.save(new Game("Game 4", LocalDateTime.now().plusHours(3)));
		Game game5 = gameRepository.save(new Game("Game 5", LocalDateTime.now().plusHours(4)));
		Game game6 = gameRepository.save(new Game("Game 6", LocalDateTime.now().plusHours(5)));

		// ...And saving them to different games.
		gamePlayerRepository.save(new GamePlayer(game1, jack));
		gamePlayerRepository.save(new GamePlayer(game2, chloe));
		gamePlayerRepository.save(new GamePlayer(game1, kim));
		gamePlayerRepository.save(new GamePlayer(game2, tony));
		gamePlayerRepository.save(new GamePlayer(game3, jack));
		gamePlayerRepository.save(new GamePlayer(game4, chloe));
		gamePlayerRepository.save(new GamePlayer(game3, kim));
		gamePlayerRepository.save(new GamePlayer(game4, tony));

		// Creating the ships for Game 1.
		Ship destroyer = new Ship("Destroyer", Arrays.asList("H2", "H3", "H4"));
		destroyer.setGame(game1);
		game1.getShips().add(destroyer);
		destroyer.setGamePlayers(jack);
		shipRepository.save(destroyer);

		Ship submarine = new Ship("Submarine", Arrays.asList("E1", "F1", "G1"));
		submarine.setGame(game1);
		game1.getShips().add(submarine);
		submarine.setGamePlayers(jack);
		shipRepository.save(submarine);

		Ship patrolBoat = new Ship("Patrol Boat", Arrays.asList("B4", "B5"));
		patrolBoat.setGame(game1);
		game1.getShips().add(patrolBoat);
		patrolBoat.setGamePlayers(jack);
		shipRepository.save(patrolBoat);

		Ship destroyer2 = new Ship("Destroyer", Arrays.asList("B5", "C5", "D5"));
		destroyer2.setGame(game1);
		game1.getShips().add(destroyer2);
		destroyer2.setGamePlayers(chloe);
		shipRepository.save(destroyer2);

		Ship patrolBoat2 = new Ship("Patrol Boat", Arrays.asList("F1", "F2"));
		patrolBoat2.setGame(game1);
		game1.getShips().add(patrolBoat2);
		patrolBoat2.setGamePlayers(chloe);
		shipRepository.save(patrolBoat2);

		// Creating the ships for Game 2.
		Ship destroyer3 = new Ship("Destroyer", Arrays.asList("B5", "C5", "D5"));
		destroyer3.setGame(game2);
		game2.getShips().add(destroyer3);
		destroyer3.setGamePlayers(jack);
		shipRepository.save(destroyer3);

		Ship patrolBoat3 = new Ship("Patrol Boat", Arrays.asList("C6", "C7"));
		patrolBoat3.setGame(game2);
		game2.getShips().add(patrolBoat3);
		patrolBoat3.setGamePlayers(jack);
		shipRepository.save(patrolBoat3);

		Ship submarine2 = new Ship("Submarine", Arrays.asList("A2", "A3", "A4"));
		submarine2.setGame(game2);
		game2.getShips().add(submarine2);
		submarine2.setGamePlayers(chloe);
		shipRepository.save(submarine2);

		Ship patrolBoat4 = new Ship("Patrol Boat", Arrays.asList("G6", "H6"));
		patrolBoat4.setGame(game2);
		game2.getShips().add(patrolBoat4);
		patrolBoat4.setGamePlayers(chloe);
		shipRepository.save(patrolBoat4);

		// Creating the ships for Game 3.
		Ship destroyer4 = new Ship("Destroyer", Arrays.asList("B5", "C5", "D5"));
		destroyer4.setGame(game3);
		game3.getShips().add(destroyer4);
		destroyer4.setGamePlayers(chloe);
		shipRepository.save(destroyer4);

		Ship patrolBoat5 = new Ship("Patrol Boat", Arrays.asList("C6", "C7"));
		patrolBoat5.setGame(game3);
		game3.getShips().add(patrolBoat5);
		patrolBoat5.setGamePlayers(chloe);
		shipRepository.save(patrolBoat5);

		Ship submarine3 = new Ship("Submarine", Arrays.asList("A2", "A3", "A4"));
		submarine3.setGame(game3);
		game3.getShips().add(submarine3);
		submarine3.setGamePlayers(tony);
		shipRepository.save(submarine3);

		Ship patrolBoat6 = new Ship("Patrol Boat", Arrays.asList("G6", "H6"));
		patrolBoat6.setGame(game3);
		game3.getShips().add(patrolBoat6);
		patrolBoat6.setGamePlayers(tony);
		shipRepository.save(patrolBoat6);

		// Creating the ships for Game 4.
		Ship destroyer5 = new Ship("Destroyer", Arrays.asList("B5", "C5", "D5"));
		destroyer5.setGame(game4);
		game4.getShips().add(destroyer5);
		destroyer5.setGamePlayers(chloe);
		shipRepository.save(destroyer5);

		Ship patrolBoat7 = new Ship("Patrol Boat", Arrays.asList("C6", "C7"));
		patrolBoat7.setGame(game4);
		game4.getShips().add(patrolBoat7);
		patrolBoat7.setGamePlayers(chloe);
		shipRepository.save(patrolBoat7);

		Ship submarine4 = new Ship("Submarine", Arrays.asList("A2", "A3", "A4"));
		submarine4.setGame(game4);
		game4.getShips().add(submarine4);
		submarine4.setGamePlayers(jack);
		shipRepository.save(submarine4);

		Ship patrolBoat8 = new Ship("Patrol Boat", Arrays.asList("G6", "H6"));
		patrolBoat8.setGame(game4);
		game4.getShips().add(patrolBoat8);
		patrolBoat8.setGamePlayers(jack);
		shipRepository.save(patrolBoat8);

		// Creating the ships for Game 5.
		Ship destroyer6 = new Ship("Destroyer", Arrays.asList("B5", "C5", "D5"));
		destroyer6.setGame(game5);
		game5.getShips().add(destroyer6);
		destroyer6.setGamePlayers(tony);
		shipRepository.save(destroyer6);

		Ship patrolBoat9 = new Ship("Patrol Boat", Arrays.asList("C6", "C7"));
		patrolBoat9.setGame(game5);
		game5.getShips().add(patrolBoat9);
		patrolBoat9.setGamePlayers(tony);
		shipRepository.save(patrolBoat9);

		Ship submarine5 = new Ship("Submarine", Arrays.asList("A2", "A3", "A4"));
		submarine5.setGame(game5);
		game5.getShips().add(submarine5);
		submarine5.setGamePlayers(jack);
		shipRepository.save(submarine5);

		Ship patrolBoat10 = new Ship("Patrol Boat", Arrays.asList("G6", "H6"));
		patrolBoat10.setGame(game5);
		game5.getShips().add(patrolBoat10);
		patrolBoat10.setGamePlayers(jack);
		shipRepository.save(patrolBoat10);

		// Creating ships for Game 6.
		Ship destroyer7 = new Ship("Destroyer", Arrays.asList("B5", "C5", "D5"));
		destroyer7.setGame(game6);
		game6.getShips().add(destroyer7);
		destroyer7.setGamePlayers(kim);
		shipRepository.save(destroyer7);

		Ship patrolBoat11 = new Ship("Patrol Boat", Arrays.asList("C6", "C7"));
		patrolBoat11.setGame(game6);
		game6.getShips().add(patrolBoat11);
		patrolBoat11.setGamePlayers(kim);
		shipRepository.save(patrolBoat11);

		Ship submarine6 = new Ship("Submarine", Arrays.asList("A2", "A3", "A4"));
		submarine6.setGame(game6);
		game6.getShips().add(submarine6);
		submarine6.setGamePlayers(kim);
		shipRepository.save(submarine6);

		Ship patrolBoat12 = new Ship("Patrol Boat", Arrays.asList("G6", "H6"));
		patrolBoat12.setGame(game6);
		game6.getShips().add(patrolBoat12);
		patrolBoat12.setGamePlayers(kim);
		shipRepository.save(patrolBoat12);
	}
}
