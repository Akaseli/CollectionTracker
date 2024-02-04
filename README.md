## Collection Tracker
App which allows you to track what ever you want.

#### Features
- Basic authentication
- Collection sharing
- Custom fields + images for items

#### How to run
After setting up a postgresql database with the commands in [here](https://github.com/Akaseli/CollectionTracker/blob/master/backend/dbSetup.sql) and setting up a `.env` in the backend directory with the these fields:
  - `SECRET` can be anything. Used for authentication.
  - `PGUSER` database username
  - `PGPASSWORD` database password
  - `PGHOST` database host address
  - `PGPORT` database port
  - `PGDATABASE` name of the database (collectiontracker, if setup not modified)

Then
1. `npm install`
2. `npm run start-dev`
3. App should be running on http://localhost:8080
