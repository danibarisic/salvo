package com.codeoftheweb.salvo;

import java.time.LocalDateTime;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.codeoftheweb.salvo.controller.SalvoController;

import org.springframework.beans.factory.annotation.Autowired;
import java.util.Arrays;

@SpringBootApplication
public class SalvoApplication implements CommandLineRunner {

	private final SalvoController salvoController;
	@Autowired
	private PlayerRepository playerRepository;

	// Connecting the different repos.
	@Autowired
	private GameRepository gameRepository;
	@Autowired
	private GamePlayerRepository gamePlayerRepository;
	@Autowired
	private ShipRepository shipRepository;
	@Autowired
	private SalvoRepository salvoRepository;
	@Autowired
	private ScoreRepository scoreRepository;

	SalvoApplication(SalvoController salvoController) {
		this.salvoController = salvoController;
	}

	public static void main(String[] args) {
		SpringApplication.run(SalvoApplication.class, args);
	}

	@Override
	public void run(String... args) throws Exception {
		// Creating the 4 players.
		Player jack = new Player("j.bauer@ctu.gov", "24");
		Player chloe = new Player("c.obrian@ctu.gov", "42");
		Player kim = new Player("kim_bauer@gmail.com", "kb");
		Player tony = new Player("t.almeida@ctu.gov", "mole");

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
		Game game7 = gameRepository.save(new Game("Game 7", LocalDateTime.now().plusHours(5)));
		Game game8 = gameRepository.save(new Game("Game 8", LocalDateTime.now().plusHours(5)));

		// ...And saving them to different games.
		GamePlayer gpj1 = gamePlayerRepository.save(new GamePlayer(game1, jack));
		GamePlayer gpc1 = gamePlayerRepository.save(new GamePlayer(game1, chloe));
		GamePlayer gpj2 = gamePlayerRepository.save(new GamePlayer(game2, jack));
		GamePlayer gpc2 = gamePlayerRepository.save(new GamePlayer(game2, chloe));
		GamePlayer gpc3 = gamePlayerRepository.save(new GamePlayer(game3, chloe));
		GamePlayer gpt3 = gamePlayerRepository.save(new GamePlayer(game3, tony));
		GamePlayer gpc4 = gamePlayerRepository.save(new GamePlayer(game4, chloe));
		GamePlayer gpj4 = gamePlayerRepository.save(new GamePlayer(game4, jack));
		GamePlayer gpt5 = gamePlayerRepository.save(new GamePlayer(game5, tony));
		GamePlayer gpj5 = gamePlayerRepository.save(new GamePlayer(game5, jack));
		GamePlayer gpk6 = gamePlayerRepository.save(new GamePlayer(game6, kim));
		GamePlayer gpt7 = gamePlayerRepository.save(new GamePlayer(game7, tony));
		GamePlayer gpt8 = gamePlayerRepository.save(new GamePlayer(game8, tony));
		GamePlayer gpk8 = gamePlayerRepository.save(new GamePlayer(game8, kim));

		// Creating the ships for Game 1.
		Ship destroyer = new Ship("Destroyer", Arrays.asList("H2", "H3", "H4"));
		gpj1.getShips().add(destroyer);
		destroyer.setGamePlayer(gpj1);
		shipRepository.save(destroyer);

		Ship submarine = new Ship("Submarine", Arrays.asList("E1", "F1", "G1"));
		gpj1.getShips().add(submarine);
		submarine.setGamePlayer(gpj1);
		shipRepository.save(submarine);

		Ship patrolBoat = new Ship("Patrol Boat", Arrays.asList("B4", "B5"));
		gpj1.getShips().add(patrolBoat);
		patrolBoat.setGamePlayer(gpj1);
		shipRepository.save(patrolBoat);

		Ship destroyer2 = new Ship("Destroyer", Arrays.asList("B5", "C5", "D5"));
		gpc1.getShips().add(destroyer2);
		destroyer2.setGamePlayer(gpc1);
		shipRepository.save(destroyer2);

		Ship patrolBoat2 = new Ship("Patrol Boat", Arrays.asList("F1", "F2"));
		gpc1.getShips().add(patrolBoat2);
		patrolBoat2.setGamePlayer(gpc1);
		shipRepository.save(patrolBoat2);

		// Creating the ships for Game 2.
		Ship destroyer3 = new Ship("Destroyer", Arrays.asList("B5", "C5", "D5"));
		gpj2.getShips().add(destroyer3);
		destroyer3.setGamePlayer(gpj2);
		shipRepository.save(destroyer3);

		Ship patrolBoat3 = new Ship("Patrol Boat", Arrays.asList("C6", "C7"));
		gpj2.getShips().add(patrolBoat3);
		patrolBoat3.setGamePlayer(gpj2);
		shipRepository.save(patrolBoat3);

		Ship submarine2 = new Ship("Submarine", Arrays.asList("A2", "A3", "A4"));
		gpc2.getShips().add(submarine2);
		submarine2.setGamePlayer(gpc2);
		shipRepository.save(submarine2);

		Ship patrolBoat4 = new Ship("Patrol Boat", Arrays.asList("G6", "H6"));
		gpc2.getShips().add(patrolBoat4);
		patrolBoat4.setGamePlayer(gpc2);
		shipRepository.save(patrolBoat4);

		// Creating the ships for Game 3.
		Ship destroyer4 = new Ship("Destroyer", Arrays.asList("B5", "C5", "D5"));
		gpc3.getShips().add(destroyer4);
		destroyer4.setGamePlayer(gpc3);
		shipRepository.save(destroyer4);

		Ship patrolBoat5 = new Ship("Patrol Boat", Arrays.asList("C6", "C7"));
		gpc3.getShips().add(patrolBoat5);
		patrolBoat5.setGamePlayer(gpc3);
		shipRepository.save(patrolBoat5);

		Ship submarine3 = new Ship("Submarine", Arrays.asList("A2", "A3", "A4"));
		gpt3.getShips().add(submarine3);
		submarine3.setGamePlayer(gpt3);
		shipRepository.save(submarine3);

		Ship patrolBoat6 = new Ship("Patrol Boat", Arrays.asList("G6", "H6"));
		gpt3.getShips().add(patrolBoat6);
		patrolBoat6.setGamePlayer(gpt3);
		shipRepository.save(patrolBoat6);

		// Creating the ships for Game 4.
		Ship destroyer5 = new Ship("Destroyer", Arrays.asList("B5", "C5", "D5"));
		gpc4.getShips().add(destroyer5);
		destroyer5.setGamePlayer(gpc4);
		shipRepository.save(destroyer5);

		Ship patrolBoat7 = new Ship("Patrol Boat", Arrays.asList("C6", "C7"));
		gpc4.getShips().add(patrolBoat7);
		patrolBoat7.setGamePlayer(gpc4);
		shipRepository.save(patrolBoat7);

		Ship submarine4 = new Ship("Submarine", Arrays.asList("A2", "A3", "A4"));
		gpj4.getShips().add(submarine4);
		submarine4.setGamePlayer(gpj4);
		shipRepository.save(submarine4);

		Ship patrolBoat8 = new Ship("Patrol Boat", Arrays.asList("G6", "H6"));
		gpj4.getShips().add(patrolBoat8);
		patrolBoat8.setGamePlayer(gpj4);
		shipRepository.save(patrolBoat8);

		// Creating the ships for Game 5.
		Ship destroyer6 = new Ship("Destroyer", Arrays.asList("B5", "C5", "D5"));
		gpt5.getShips().add(destroyer6);
		destroyer6.setGamePlayer(gpt5);
		shipRepository.save(destroyer6);

		Ship patrolBoat9 = new Ship("Patrol Boat", Arrays.asList("C6", "C7"));
		gpt5.getShips().add(patrolBoat9);
		patrolBoat9.setGamePlayer(gpt5);
		shipRepository.save(patrolBoat9);

		Ship submarine5 = new Ship("Submarine", Arrays.asList("A2", "A3", "A4"));
		gpj5.getShips().add(submarine5);
		submarine5.setGamePlayer(gpj5);
		shipRepository.save(submarine5);

		Ship patrolBoat10 = new Ship("Patrol Boat", Arrays.asList("G6", "H6"));
		gpj5.getShips().add(patrolBoat10);
		patrolBoat10.setGamePlayer(gpj5);
		shipRepository.save(patrolBoat10);

		// Creating ships for Game 6.
		Ship destroyer7 = new Ship("Destroyer", Arrays.asList("B5", "C5", "D5"));
		gpk6.getShips().add(destroyer7);
		destroyer7.setGamePlayer(gpk6);
		shipRepository.save(destroyer7);

		Ship patrolBoat11 = new Ship("Patrol Boat", Arrays.asList("C6", "C7"));
		gpk6.getShips().add(patrolBoat11);
		patrolBoat11.setGamePlayer(gpk6);
		shipRepository.save(patrolBoat11);
		gamePlayerRepository.save(gpk6);

		// Creating ships for Game 8.
		Ship destroyer8 = new Ship("Destroyer", Arrays.asList("B5", "C5", "D5"));
		gpk8.getShips().add(destroyer8);
		destroyer8.setGamePlayer(gpk8);
		shipRepository.save(destroyer8);

		Ship patrolBoat12 = new Ship("Patrol Boat", Arrays.asList("C6", "C7"));
		gpk8.getShips().add(patrolBoat12);
		patrolBoat12.setGamePlayer(gpk8);
		shipRepository.save(patrolBoat12);

		Ship submarine6 = new Ship("Submarine", Arrays.asList("A2", "A3", "A4"));
		gpt8.getShips().add(submarine6);
		submarine6.setGamePlayer(gpt8);
		shipRepository.save(submarine6);

		Ship patrolBoat13 = new Ship("Patrol Boat", Arrays.asList("G6", "H6"));
		gpt8.getShips().add(patrolBoat13);
		patrolBoat13.setGamePlayer(gpt8);
		shipRepository.save(patrolBoat13);

		Salvo salvo1 = new Salvo(gpj1, 1, Arrays.asList("B5", "C5", "F1"));
		salvo1.setGamePlayer(gpj1);
		salvoRepository.save(salvo1);

		Salvo salvo2 = new Salvo(gpc1, 1, Arrays.asList("B4", "B5", "B6"));
		salvo2.setGamePlayer(gpc1);
		salvoRepository.save(salvo2);

		Salvo salvo3 = new Salvo(gpj1, 2, Arrays.asList("F2", "D5"));
		salvo3.setGamePlayer(gpj1);
		salvoRepository.save(salvo3);

		Salvo salvo4 = new Salvo(gpc1, 2, Arrays.asList("E1", "H3", "A2"));
		salvo4.setGamePlayer(gpc1);
		salvoRepository.save(salvo4);

		Salvo salvo5 = new Salvo(gpj2, 1, Arrays.asList("A2", "A4", "G6"));
		salvo5.setGamePlayer(gpj2);
		salvoRepository.save(salvo5);

		Salvo salvo6 = new Salvo(gpc2, 1, Arrays.asList("B5", "D5", "C7"));
		salvo6.setGamePlayer(gpc2);
		salvoRepository.save(salvo6);

		Salvo salvo7 = new Salvo(gpj2, 2, Arrays.asList("A3", "h6"));
		salvo7.setGamePlayer(gpj2);
		salvoRepository.save(salvo7);

		Salvo salvo8 = new Salvo(gpc2, 2, Arrays.asList("C5", "C6"));
		salvo8.setGamePlayer(gpc2);
		salvoRepository.save(salvo8);

		Salvo salvo9 = new Salvo(gpc3, 1, Arrays.asList("G6", "H6", "A4"));
		salvo9.setGamePlayer(gpc3);
		salvoRepository.save(salvo9);

		Salvo salvo10 = new Salvo(gpt3, 1, Arrays.asList("H1", "H2", "H3"));
		salvo10.setGamePlayer(gpt3);
		salvoRepository.save(salvo10);

		Salvo salvo11 = new Salvo(gpc3, 2, Arrays.asList("A2", "A3", "D8"));
		salvo11.setGamePlayer(gpc3);
		salvoRepository.save(salvo11);

		Salvo salvo12 = new Salvo(gpt3, 2, Arrays.asList("E1", "F2", "G3"));
		salvo12.setGamePlayer(gpt3);
		salvoRepository.save(salvo12);

		Salvo salvo13 = new Salvo(gpc4, 1, Arrays.asList("A3", "A4", "F7"));
		salvo13.setGamePlayer(gpc4);
		salvoRepository.save(salvo13);

		Salvo salvo14 = new Salvo(gpj4, 1, Arrays.asList("B5", "C6", "H1"));
		salvo14.setGamePlayer(gpj4);
		salvoRepository.save(salvo14);

		Salvo salvo15 = new Salvo(gpc4, 2, Arrays.asList("A2", "G6", "H6"));
		salvo15.setGamePlayer(gpc4);
		salvoRepository.save(salvo15);

		Salvo salvo16 = new Salvo(gpj4, 2, Arrays.asList("C5", "C7", "D5"));
		salvo16.setGamePlayer(gpj4);
		salvoRepository.save(salvo16);

		Salvo salvo17 = new Salvo(gpt5, 1, Arrays.asList("A1", "A2", "A3"));
		salvo17.setGamePlayer(gpt5);
		salvoRepository.save(salvo17);

		Salvo salvo18 = new Salvo(gpj5, 1, Arrays.asList("B5", "B6", "C7"));
		salvo18.setGamePlayer(gpj5);
		salvoRepository.save(salvo18);

		Salvo salvo19 = new Salvo(gpt5, 2, Arrays.asList("G6", "G7", "G8"));
		salvo19.setGamePlayer(gpt5);
		salvoRepository.save(salvo19);

		Salvo salvo20 = new Salvo(gpj5, 2, Arrays.asList("C6", "D6", "E6"));
		salvo20.setGamePlayer(gpj5);
		salvoRepository.save(salvo20);

		Salvo salvo21 = new Salvo(gpj5, 3, Arrays.asList("H1", "H8"));
		salvo21.setGamePlayer(gpj5);
		salvoRepository.save(salvo21);

		// Creating the scores according to the sample table.
		Score score1 = new Score(gpj1, game1, 1.0);
		score1.setPlayer(gpj1.getPlayer());
		game1.getScores().add(score1);
		scoreRepository.save(score1);

		Score score2 = new Score(gpc1, game1, 0.0);
		score2.setPlayer(gpc1.getPlayer());
		game1.getScores().add(score2);
		scoreRepository.save(score2);

		Score score3 = new Score(gpj2, game2, 0.5);
		score3.setPlayer(gpj2.getPlayer());
		game2.getScores().add(score3);
		scoreRepository.save(score3);

		Score score4 = new Score(gpc2, game2, 0.5);
		score4.setPlayer(gpc2.getPlayer());
		game2.getScores().add(score4);
		scoreRepository.save(score4);

		Score score5 = new Score(gpc3, game3, 1.0);
		score5.setPlayer(gpc3.getPlayer());
		game3.getScores().add(score5);
		scoreRepository.save(score5);

		Score score6 = new Score(gpt3, game3, 0.0);
		score6.setPlayer(gpt3.getPlayer());
		game3.getScores().add(score6);
		scoreRepository.save(score6);

		Score score7 = new Score(gpc4, game4, 0.5);
		score7.setPlayer(gpc4.getPlayer());
		game4.getScores().add(score7);
		scoreRepository.save(score7);

		Score score8 = new Score(gpj4, game4, 0.5);
		score8.setPlayer(gpj4.getPlayer());
		game4.getScores().add(score8);
		scoreRepository.save(score8);
	}

	@Configuration
	@EnableWebSecurity
	public class SecurityConfig {

		@Autowired
		private PlayerRepository playerRepository;

		@Bean
		public UserDetailsService userDetailsService() {
			var user = User.withDefaultPasswordEncoder()
					.username("user")
					.password("password")
					.roles("USER")
					.build();

			return new InMemoryUserDetailsManager(user);
		};
	}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http.authorizeHttpRequests(authorize -> authorize.anyRequest().authenticated())
				.formLogin(form -> form.loginPage("/login").permitAll());

		return http.build();
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return PasswordEncoderFactories.createDelegatingPasswordEncoder();
	}

}
