package com.codeoftheweb.salvo;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.beans.factory.annotation.Autowired;

@SpringBootApplication
public class SalvoApplication implements CommandLineRunner {
	@Autowired
	private PlayerRepository playerRepository;

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
	}
}
