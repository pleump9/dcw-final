require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = 8000

const upload = require("./middleware/upload");
const Grid = require("gridfs-stream");
const mongoose = require("mongoose");
const connection = require("./db");

const logger = require('./logger');

app.use(cors())

//-------------------- DB --------------------
let gfs;
connection();

const conn = mongoose.connection;
conn.once("open", function () {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("contents");
});

//-------------------- Authen --------------------

const TOKEN_SECRET = '870d1fa5011e4d963addea0978c52b321fdc694f9d3632fa9c343f080a5c1d76ee097ce353f9bfe5add221d8285e49a0a1716746f1911c5b3fd1bdf777fde11c'
var jwt = require('jsonwebtoken');

const authtenticated = (req, res, next) => {
  const auth_header = req.headers['authorization']
  const token = auth_header && auth_header.split(' ')[1]
  if (!token) {
    logger.error('No Token!')
    return res.sendStatus(401)
  }
  jwt.verify(token, TOKEN_SECRET, (err, info) => {
    if (err) {
      logger.error('Token Err')
      return res.sendStatus(403)
    }
    req.username = info.username
    next()
  })
}

//-------------------- API -------------------------
app.get('/api', (req, res) => {
  res.send('Hello World!')
})

app.post("/api/form/submit", upload.single("file"), async (req, res) => {
  if (req.file === undefined) return res.send("you must select a file.");
  const imgUrl = `http://localhost:8000/file/${req.file.filename}`;
  logger.info('Submit Form');
  return res.send(imgUrl + '\n text : ' + req.body.text + '\n email : ' + req.body.email);
})

app.get("/api/form/history", async (req, res) => {
  try {
    const fileList = await gfs.files.find({ "metadata.email": req.query.email }).toArray();
    fileList.sort(function (a, b) {
      return new Date(b.uploadDate) - new Date(a.uploadDate);
    });
    res.send(fileList)
    logger.info('Get History Successful!')
  } catch (error) {
    res.send("not found");
    logger.error('Get History Failed!')
  }
})

//-------------------- API  Login -------------------------
app.post('/api/login', bodyParser.json(), async (req, res) => {
  let token = req.body.token
  let result = await axios.get('https://graph.facebook.com/me', {
    params: {
      fields: 'id,name,email',
      access_token: token
    }
  })
  logger.info('Logged in');

  if (!result.data.id) {
    logger.error('Can not Login')
    res.sendStatus(403)
    return
  }
  let data = {
    username: result.data.email
  }
  let access_token = jwt.sign(data, TOKEN_SECRET, { expiresIn: '1800s' })
  res.send({ access_token, username: data.username })
})

//-------------------- File -------------------------
app.post("/api/file/upload", upload.single("file"), async (req, res) => {
  if (req.file === undefined) return res.send("you must select a file.");
  const imgUrl = `http://localhost:8000/file/${req.file.filename}`;
  return res.send(imgUrl + req.body.name);
});

app.get("/api/file/:filename", async (req, res) => {
  try {
    const file = await gfs.files.findOne({ filename: req.params.filename });
    const readStream = gfs.createReadStream(file.filename);
    readStream.pipe(res);
  } catch (error) {
    res.send("not found");
  }
});

app.get("/api/file/:filename", async (req, res) => {
  try {
    const file = await gfs.files.findOne({ filename: req.params.filename });
    const readStream = gfs.createReadStream(file.filename);
    readStream.pipe(res);
  } catch (error) {
    res.send("not found");
  }
});

app.delete("/api/file/:_id", async (req, res) => {
  try {
    const ObjectID = require('mongodb').ObjectId;
    await gfs.files.deleteOne({
      _id: new
        ObjectID(req.params._id)
    });
    res.send(`ObjectId("${req.params._id}")`);
  } catch (error) {
    console.log(error);
    res.send("An error occured.");
  }
});

//-------------------- PORT -------------------------
app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})