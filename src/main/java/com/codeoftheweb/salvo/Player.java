package com.codeoftheweb.salvo;

import jakarta.persistence.Entity;

@Entity
public class Player {

  private String userName;

  public String getUserName() {
    return userName;
  }

  public void setUserName(String userName) {
    this.userName = userName;
  }

  public Player(String userName, String email) {
    this.userName = email;
  }
}