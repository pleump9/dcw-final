const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios')
const cors = require('cors')
const mongoose = require('mongoose')
const app = express()
const port = 8080

mongoose.connect('mongodb://localhost/subscribers')

app.use(cors())

const TOKEN_SECRET = '870d1fa5011e4d963addea0978c52b321fdc694f9d3632fa9c343f080a5c1d76ee097ce353f9bfe5add221d8285e49a0a1716746f1911c5b3fd1bdf777fde11c'
var jwt = require('jsonwebtoken');

const authtenticated = (req, res, next) => {
  const auth_header = req.headers['authorization']
  const token = auth_header && auth_header.split(' ')[1]
  if(!token){
      return res.sendStatus(401)
  }
  jwt.verify(token, TOKEN_SECRET, (err, info) => {
      if(err){
          return res.sendStatus(403)
      }
      req.username = info.username
      next()
  })
}

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/api/login', bodyParser.json(), async (req, res) => {
  let token = req.body.token
  let result = await axios.get('https://graph.facebook.com/me', {
    params: {
      fields: 'id,name,email',
      access_token: token
    }
  })
  if (!result.data.id) {
    res.sendStatus(403)
    return
  }
  let data = {
    username: result.data.email
  }
  let access_token = jwt.sign(data, TOKEN_SECRET, { expiresIn: '1800s' })
  res.send({ access_token, username: data.username })
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})

app.get('/api/info', authtenticated, (req, res)  => {
  res.send({ok: 1, username: req.username})
})
