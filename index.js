const express = require('express')
const bodyParser = require('body-parser')
const routes = require('./src/routes')
const auth = require('./src/middlewares/auth')


const app = express()
const db = require('./src/db')
db.mongo.connect()

app.use(bodyParser.json())
app.use(auth(app, db))
routes(app, db)

if (typeof require != 'undefined' && require.main==module) {
  const port = process.env.PORT || 3000
  console.log('Listening on port ' + port)
  app.listen(port)
}

module.exports = app
module.exports.db = db
