-- Database
CREATE DATABASE collectiontracker;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User table
CREATE TABLE users (
  id integer GENERATED ALWAYS AS IDENTITY,
  username text,
  "password" text,

  PRIMARY KEY (id)
);

-- Collection Table
CREATE TABLE collections (
  id integer GENERATED ALWAYS AS IDENTITY,
  pictureid integer,
  "name" text,
  "description" text,
  "owner" integer,
  template jsonb,

  PRIMARY KEY (id),
  FOREIGN KEY ("owner") REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (pictureid) REFERENCES pictures(id) ON DELETE SET NULL
);

CREATE TABLE sharedtables (
  tableId integer,
  userId integer,

  FOREIGN KEY (tableId) REFERENCES collections(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Image table
CREATE TABLE pictures (
  id integer GENERATED ALWAYS AS IDENTITY,
  "filename" text,

  PRIMARY KEY (id)
);

-- Invite table
CREATE TABLE invites (
  id integer GENERATED ALWAYS AS IDENTITY,
  expires integer,
  senderid integer,
  collectionid integer,
  targetid integer,

  PRIMARY KEY (id),
  FOREIGN KEY (senderid) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (targetid) REFERENCES users(id) ON DELETE CASCADE,

  FOREIGN KEY (collectionid) REFERENCES collections(id) ON DELETE CASCADE
);

-- NOT CREATED

--Collectible table
CREATE TABLE collectible (
  id integer GENERATED ALWAYS AS IDENTITY,
  collectionid integer,
  creator integer,
  "name" text,
  "description" text,
  pictureid integer,
  "data" jsonb,

  PRIMARY KEY (id),
  FOREIGN KEY (collectionid) REFERENCES collections(id) ON DELETE CASCADE,
  FOREIGN KEY (creator) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (pictureid) REFERENCES pictures(id) ON DELETE SET NULL
);