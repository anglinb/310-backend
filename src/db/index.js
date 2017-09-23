
const fs = require('fs')
const path = require('path')
const { Database } = require('mongorito')
const plugins = require('./plugins')
const timestamps = require('mongorito-timestamps')

const basename = path.basename(module.filename)
var exp = {}

// Connect the database
const db = new Database(process.env.MONGO_DB_URL || 'localhost/sanity')
db.use(timestamps())
exp.mongo = db

fs.readdirSync(__dirname)
  .filter((file) => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js')
  })
  .forEach(function (file) {
    // Require each model & wire up the database
    var model = require(path.join(__dirname, file))
    db.register(model)
    exp[model.name] = model
  })

plugins(exp) // Registers all the plugins

module.exports = exp
