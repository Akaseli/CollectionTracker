//Env
import * as dotenv from 'dotenv'
dotenv.config({ path: __dirname + '/.env' })

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import session from "express-session";
import passport from "passport";



import { StrategyOptions, Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";

const app = express();
const port = 3000;

// Middleware
app.use(
  cors({
    origin: "http://localhost:8080",
    credentials: true
  })
);

if(process.env.SECRET == undefined){
  throw new Error("Must have a secret to run this thing.")
}

app.use(cookieParser(process.env.SECRET));

app.use(bodyParser.urlencoded({ extended: true}));

app.use(
  session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true
  })
);

//Passport Stuff
app.use(passport.initialize());
app.use(passport.session());

var options:StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey : process.env.SECRET,
  issuer: "login.localhost",
  audience: "localhost"
}

passport.use(new JwtStrategy(options, (jwt_payload, done) => {
  console.log(jwt_payload)


  //TODO: similar in psql
  /*
    User.findOne({id: jwt_payload.sub}, function(err, user) {
      if (err) {
          return done(err, false);
      }
      if (user) {
          return done(null, user);
      } else {
          return done(null, false);
          // or you could create a new account
      }
    });
  */
}));



//Routes
app.get("/api/", (req, res) => {
  res.send("Api is running.");
});

app.post("/api/login/", (req, res) => {
  //Figure out
})

//Authenticated route
app.get("/api/secret/", passport.authenticate("jwt", {session: false}), (req, res) => {
  res.send("Secret stuff")
})

app.listen(port, () => {
  console.log("Listening on port " + port);
});