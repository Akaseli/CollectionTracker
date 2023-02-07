//Env
import * as dotenv from 'dotenv'
dotenv.config({ path: __dirname + '/.env' })

import express from "express";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser, { urlencoded } from "body-parser";
import session from "express-session";
import { Pool } from "pg";
import cookie from "cookie"


//Express
const app = express();
const port = 3000;
const server = http.createServer(app)

// Bcrypt
import * as bcrypt from "bcrypt";
const salt = 10

//Auth
import passport from "passport";
import jwt from "jsonwebtoken"
import { StrategyOptions, Strategy as JwtStrategy } from "passport-jwt";

//Socket.io
import { Server } from 'socket.io';
const io = new Server(server, {
  cors: {
    origin: "http://localhost:8080",
    credentials: true
  },
})


//Database
const pool = new Pool({
  connectionString: `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`,
})

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

app.use(bodyParser.json());
app.use(urlencoded({extended: true}));

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

const cookieExtractor = req => {
  let jwt = null

  if(req && req.cookies){
    jwt = req.cookies['jwt']
  }

  return jwt
}

var options:StrategyOptions = {
  jwtFromRequest: cookieExtractor,
  secretOrKey : process.env.SECRET
}

//User types
declare global {
  namespace Express{
    interface User{
      id: number,
      name: string
    }
  }
}

passport.use("jwt", new JwtStrategy(options, (jwt_payload, done) => {
  //TODO CHECK if expired

  pool.query("SELECT * FROM users WHERE id = $1", [jwt_payload.id], (err, result) => {
    if (err){
      throw err
    }
    //User exists
    if (result.rowCount > 0){
      return done(null, jwt_payload)
    }
    else {
      return done(null, false)
    }
  })
}));

//Routes
app.get("/api/", (req, res) => {
  res.send("Api is running.");
});

app.post("/api/login/", (req, res) => {
  pool.query("SELECT * FROM users WHERE username = $1", [req.body.username], async (err, result) => {
    if(err){
      throw err
    }

    // Username -> validate
    if (result.rows.length > 0){
      const password = req.body.password
      const userpassword = result.rows[0].password

      const match = bcrypt.compareSync(password, userpassword)

      //Login
      if(match){
        const payload = {
          id: result.rows[0].id,
          username: result.rows[0].username
        }

        if(process.env.SECRET == undefined){
          throw new Error("Secret not defined.")
        }

        //Expires in 1 day
        const token = jwt.sign(payload, process.env.SECRET, { expiresIn : 1000 * 60 * 24 })
        
        res.cookie('jwt', token, {
          httpOnly: true,
          secure: process.env.PRODUCTION ? true : false
        }).send({message: "Login successful.", status: "success"})

      }
      //Incorrect password
      else{
        res.send({message: "Incorrect username or password."})
      }
    }
    //No user
    else{
      res.send({message: "Incorrect username or password."})
    }
  })
})

app.post("/api/register/", (req, res) => {
  //TODO validate password lenght and username lenght
  if(req.body.username.length < 4){
    res.send({message: "Username too short."})
    return
  }
  if(req.body.password.length < 6){
    res.send({message: "Password too short."})
    return
  }

  pool.query("SELECT * FROM users WHERE username = $1", [req.body.username], async (err, result) => {
    if(err){
      throw err
    }
    // User exists
    if (result.rows.length > 0){
      res.send({message: "Username taken."})
    }

    //Doesnt exist -> Create user
    if (result.rows.length == 0){
      const username = req.body.username
      let password = bcrypt.hashSync(req.body.password, salt) 

      pool.query("INSERT INTO users(username, password) VALUES ($1, $2)", [username, password], (err, result) => {
        if(err){
          throw err
        }
        console.log("CREATED USER")
        res.send({message: "Account Successfully created!", status: "success"})
      })
    }
  })
})

// Collection Routes
app.post("/api/collection", passport.authenticate("jwt", {session: false}), (req, res) => {
  const user = req.user?.id


})



//Authenticated route test
app.get("/api/secret/", passport.authenticate("jwt", {session: false}), (req, res) => {
  res.send("Secret stuff requested by " + req.user?.id )
})

//Socket stuff
io.on("connection", (socket) => {
  //Cookies
  if(!socket.handshake.headers.cookie) {
    socket.disconnect()
    return
  }

  let cookies = cookie.parse(socket.handshake.headers.cookie)
  

})

server.listen(port, () => {
  console.log("Listening on port " + port);
});