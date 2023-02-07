-- Database
CREATE DATABASE collectiontracker;

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
  pictureId integer,
  "name" text,
  "description" text,
  "owner" integer,
  template jsonb,

  PRIMARY KEY (id),
  FOREIGN KEY ("owner") REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (pictureId) REFERENCES pictures(id) ON DELETE SET NULL
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
