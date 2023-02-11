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
import fileUpload from 'express-fileupload';

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
import sharp from 'sharp';
import { v4 } from 'uuid';

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
app.use(fileUpload())

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

/*
=============================
        API ROUTES
=============================
*/
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
        const token = jwt.sign(payload, process.env.SECRET, { expiresIn : 60*60*24 })
        
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
app.post("/api/collection", passport.authenticate("jwt", {session: false}), async (req, res) => {
  const user = req.user?.id
  const name = req.body.name
  const description = req.body.description
  const template = req.body.fields
  let imageId = null

  //Image for set exists
  if(req.files){
    let file = req.files["image"]
    
    //@ts-ignore File.buffer doesnt exist in type definitions
    const image = sharp(file.data)
    const crop = JSON.parse(req.body.crop)


    //Extract
    if(crop.width != 0 && crop.height != 0){
      image.extract({
        left: Math.round(crop.x * req.body.scaleX),
        top: Math.round(crop.y  * req.body.scaleY),
        width: Math.round(crop.width * req.body.scaleX),
        height: Math.round(crop.height * req.body.scaleY)
      })
    }
    else{
      image.resize(500, 500, {
        fit: sharp.fit.cover,
        withoutReduction: false
      })
    }

    //TODO maybe check if file already exists
    const fileName = v4() + ".jpeg";

    image
      .toFormat("jpeg")
      .toFile(`./backend/usercontent/${fileName}`)

    const { rows } = await pool.query("INSERT INTO pictures(filename) VALUES ($1) RETURNING id", [fileName])
    imageId = rows[0].id
  }
  
  console.log("Image ", imageId)

  //Create new collection
  pool.query("INSERT INTO collections(pictureId, name, description, owner, template) VALUES ($1, $2, $3, $4, $5)", [imageId, name, description, user, template], (err, res) => {
    if(err){
      throw err
    }
  })

  res.sendStatus(200)
})

app.get("/api/collections",  passport.authenticate("jwt", {session: false}), (req, res) => {
  pool.query("SELECT id, pictureid, name, description FROM collections WHERE owner = $1", [req.user?.id], (err, response) => {
    if(err){
      throw err
    }

    res.send(response.rows)
  })

})

app.get("/api/collections/:id",  passport.authenticate("jwt", {session: false}), (req, res) => {
  pool.query("SELECT id, pictureid, name, description, template FROM collections WHERE owner = $1 AND id = $2", [req.user?.id, req.params.id], (err, response) => {
    if(err){
      throw err
    }

    res.send(response.rows)
  })

})

//Image route
app.get("/api/static/:imageId", passport.authenticate("jwt", {session: false}), async (req, res) => {
  //TODO CHECK IF USER HAS ACCESS TO SAID IMAGE

  const { rows } = await pool.query("SELECT filename FROM pictures WHERE id = $1", [req.params.imageId])
  
  res.sendFile(`${__dirname}/usercontent/${rows[0]["filename"]}`)
})


//Authenticated route test
app.get("/api/secret/", passport.authenticate("jwt", {session: false}), (req, res) => {
  res.send("Secret stuff requested by " + req.user?.id )
})

/*
=============================
        WEB SOCKET
=============================
*/
io.on("connection", async (socket) => {
  //Cookies
  if(!socket.handshake.headers.cookie) {
    socket.disconnect()
    return
  }

  let cookies = cookie.parse(socket.handshake.headers.cookie)

  if(process.env.SECRET == undefined){
    throw new Error("Secret not defined.")
  }
  
  const user = jwt.verify(cookies["jwt"], process.env.SECRET)
  //TODO handle expired error
  
  //Join room
  socket.join(user["id"])
})

server.listen(port, () => {
  console.log("Listening on port " + port);
});