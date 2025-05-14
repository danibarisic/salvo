package com.example.practice.model;

import jakarta.persistence.*;

public class Person {

  private String firstName;
  private String lastName;
  private String email;
  private String password;

  public Person() {
  }

  public Person(String firstName, String lastName, String email, String password) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.password = password;
  }
}