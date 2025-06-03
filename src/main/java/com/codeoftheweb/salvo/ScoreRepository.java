package com.codeoftheweb.salvo;

import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.data.jpa.repository.JpaRepository;

@RepositoryRestController
public interface ScoreRepository extends JpaRepository<Score, Long> {

}
