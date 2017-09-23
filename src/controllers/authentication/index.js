const controllers = require('require-dir')()

module.exports = (app, db) => {
  const router = require('express').Router()
  Object.keys(controllers).map((key) => {
    controllers[key](router, app, db)
  })
  return router
}
module.exports.controllers = controllers
