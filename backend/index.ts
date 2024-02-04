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

//File management
import fs from "fs"

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

const usercontent = "./backend/usercontent";
if(!fs.existsSync(usercontent)){
  fs.mkdirSync(usercontent)
}

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
      username: string
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
        }).send({message: "Login successful.", status: "success", id: payload.id, username: payload.username})

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

app.get("/api/user", passport.authenticate("jwt", {session: false}), async (req, res) => {
  res.send({id: req.user?.id, username: req.user?.username})
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

    const fileName = v4() + ".jpeg";

    image
      .toFormat("jpeg")
      .toFile(`${usercontent}/${fileName}`)

    const { rows } = await pool.query("INSERT INTO pictures(filename) VALUES ($1) RETURNING id", [fileName])
    imageId = rows[0].id
  }
  
  //Create new collection
  pool.query("INSERT INTO collections(pictureId, name, description, owner, template) VALUES ($1, $2, $3, $4, $5)", [imageId, name, description, user, template], (err, res) => {
    if(err){
      throw err
    }
  })

  res.sendStatus(200)
})

//Add item to collection
app.post("/api/collections/:id/create", passport.authenticate("jwt", {session: false}), async (req, res) => {
  const user = req.user?.id
  const name = req.body.name
  const description = req.body.description
  const template = req.body.values
  let imageId = null

  //Check if user has rights to said collection
  const { rows } = await pool.query("SELECT id FROM collections WHERE (owner = $1 OR (id IN (SELECT tableid FROM sharedtables WHERE userid = $1))) AND id = $2", [req.user?.id, req.params.id])

  if(!rows){
    res.sendStatus(403)
    return
  }

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

    const fileName = v4() + ".jpeg";

    await image
      .toFormat("jpeg")
      .toFile(`./backend/usercontent/${fileName}`)

    const { rows } = await pool.query("INSERT INTO pictures(filename) VALUES ($1) RETURNING id", [fileName])
    imageId = rows[0].id

  }

  //Create new collection
  pool.query("INSERT INTO collectible(pictureid, collectionid, name, description, creator, data) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id", [imageId, req.params.id, name, description, user, template], (err, res) => {
    if(err){
      throw err
    }

    let cId = res.rows[0].id
    io.to(`room-${req.params.id}`).emit("create", {"id": cId, "pictureid": imageId, "name": name, "description": description, "data": JSON.parse(template)})
  })

  res.sendStatus(200)
})

//Delete Item from collection
app.delete("/api/collections/:id/delete/:collectible",  passport.authenticate("jwt", {session: false}), async (req, res) => {
  const user = req.user?.id
  const collection = req.params.id
  const collectible = req.params.collectible

  //Check for rights
  const { rows } = await pool.query("SELECT id FROM collections WHERE (owner = $1 OR (id IN (SELECT tableid FROM sharedtables WHERE userid = $1))) AND id = $2", [user, collection])

  if(!rows){
    res.sendStatus(403)
    return
  }

  //Get image id
  const imageId = await pool.query("DELETE FROM collectible WHERE id = $1 AND collectionid = $2 RETURNING pictureid", [collectible, collection])
  const pictureId = imageId.rows[0]["pictureid"]
  
  //Delete Image
  const filename = await pool.query("DELETE FROM pictures WHERE id = $1 RETURNING filename", [pictureId])
  const parsedFilename = filename.rows[0]["filename"]

  console.log(parsedFilename)

  fs.unlink(`./backend/usercontent/${parsedFilename}`, (err) => {
    if(err){
      //Handle properly
    }

    console.log("FILE DELETED SUCCESSFULLY")
  })
  
  io.to(`room-${collection}`).emit("delete", collectible)

  res.sendStatus(200)
})

//Get collections shared + owned
app.get("/api/collections",  passport.authenticate("jwt", {session: false}), (req, res) => {
  pool.query("SELECT id, pictureid, name, description, owner FROM collections WHERE owner = $1 OR (id IN (SELECT tableid FROM sharedtables WHERE userid = $1))", [req.user?.id], (err, response) => {
    if(err){
      throw err
    }

    res.send(response.rows)
  })

})

app.get("/api/collections/:id", passport.authenticate("jwt", {session: false}), async (req, res) => {
  const { rows } = await pool.query("SELECT id, pictureid, name, description, template, owner FROM collections WHERE (owner = $1 OR (id IN (SELECT tableid FROM sharedtables WHERE userid = $1))) AND id = $2", [req.user?.id, req.params.id])

  if(!rows[0]){
    res.sendStatus(403)
    return
  }
  
  const collectibles = await pool.query("SELECT id, name, description, data, pictureid FROM collectible WHERE collectionid = $1", [req.params.id])

  res.send({...rows[0], collectibles: collectibles.rows})
})

//Image route
app.get("/api/static/:imageId", passport.authenticate("jwt", {session: false}), async (req, res) => {
  const userId = req.user?.id

  const userPermission = await pool.query("SELECT id FROM collections WHERE (id = (SELECT collectionid AS id FROM collectible WHERE pictureid = $1 UNION SELECT id FROM collections WHERE pictureid = $1)) AND (owner = $2 OR (id IN (SELECT tableid FROM sharedtables WHERE userid = $2)))", [req.params.imageId, userId])


  if(userPermission.rowCount == 0){
    res.sendStatus(403)
  }
  else{
    const { rows } = await pool.query("SELECT filename FROM pictures WHERE id = $1", [req.params.imageId])
  
    res.sendFile(`${__dirname}/usercontent/${rows[0]["filename"]}`)
  }
})


//Create invite
app.post("/api/invite" , passport.authenticate("jwt", {session: false}), async (req, res) => {
  const user = req.user

  const invitedUser = req.body.user
  const collection = req.body.collection

  //Check if request user owns collection with the id of the request.
  const { rows } = await pool.query("SELECT id, name FROM collections WHERE owner = $1 AND id = $2", [user?.id, collection])

  //Find user 
  const userResult = await pool.query("SELECT id FROM users WHERE username = $1", [invitedUser])

  if(!rows[0] || !userResult.rows[0] || userResult.rows[0]["id"] == user?.id){
    //No one to invite/no permission
    res.sendStatus(200)
    return
  }

  //Expires in a day
  const expires = Math.floor(Date.now() / 1000) + 60*60*24

  //Create invitation in database
  const idRows = await pool.query("INSERT INTO invites(expires, senderid, collectionid, targetid) VALUES ($1, $2, $3, $4) RETURNING id", [expires, req.user?.id, collection, userResult.rows[0]["id"]])

  //Send invitation
  io.to(userResult.rows[0]["id"]).emit("invite", JSON.stringify({from: user?.username, collectionName: rows[0]["name"], inviteId: idRows.rows[0]["id"]}))

  res.sendStatus(200)
})

app.get("/api/invites" , passport.authenticate("jwt", {session: false}), async (req, res) => {
  const { rows } = await pool.query(`SELECT users.username AS from, collections.name AS "collectionName", invites.id AS "inviteId" FROM invites INNER JOIN collections ON invites.collectionid = collections.id INNER JOIN users ON users.id = invites.senderid WHERE targetid = $1 AND expires > $2`, [req.user?.id, Math.ceil(Date.now() / 1000)])

  res.send(rows)
})

app.post("/api/invite/accept/:id", passport.authenticate("jwt", {session: false}), async (req, res) => {
  const user = req.user?.id
 

  const { rows } = await pool.query("SELECT collectionid FROM invites WHERE targetId = $1 AND id = $2", [user, req.params.id])

  if(rows){
    const collection = rows[0]["collectionid"]

    pool.query("INSERT INTO sharedtables(tableid, userid) VALUES($1, $2)", [collection, user])
  }

  pool.query("DELETE FROM invites WHERE targetid = $1 AND id = $2", [user, req.params.id])
  res.sendStatus(200)
})

app.post("/api/invite/decline/:id", passport.authenticate("jwt", {session: false}), async (req, res) => {
  const user = req.user?.id

  pool.query("DELETE FROM invites WHERE targetid = $1 AND id = $2", [user, req.params.id])
  res.sendStatus(200)
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
  
  if(!cookies["jwt"]){
    socket.disconnect()
    return
  }

  const user = jwt.verify(cookies["jwt"], process.env.SECRET)
  //TODO handle expired error
  

  socket.on("join", async (arg) => {
    //Verify access
    const { rows } = await pool.query("SELECT id FROM collections WHERE (owner = $1 OR (id IN (SELECT tableid FROM sharedtables WHERE userid = $1))) AND id = $2", [user["id"], arg])
    if(!rows) return
    console.log("ROOM MOVE")
    socket.join(`room-${arg}`)
  });
  //Join room
  socket.join(user["id"])
})

server.listen(port, () => {
  console.log("Listening on port " + port);
});