-- Database
CREATE DATABASE collectiontracker;

-- User table
CREATE TABLE users (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username text,
  password text
);