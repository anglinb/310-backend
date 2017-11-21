const fs = require('fs')
const path = require('path')
const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const routes = require('./src/routes')
const logger = require('./src/helpers/logger')
const cache = require('./src/helpers/cache')

if (fs.existsSync(path.join(__dirname, '.env'))) {
  require('dotenv').config()
}

const app = express()
const db = require('./src/db')
db.mongo.connect()

cache(app)
logger(app)

app.use(morgan(':method :url :status :remote-addr :res[content-length] - :response-time ms'))

app.use(bodyParser.json())
routes(app, db)

app.use(function (err, req, res, next) {
  res.status(400).json(err)
})


if (typeof require !== 'undefined' && require.main === module) {
  const port = process.env.PORT || 3000
  console.log('Listening on port ' + port)
  app.listen(port)
}

module.exports = app
module.exports.db = db
