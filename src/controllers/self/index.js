const Router = require('express').Router
const controllers = require('require-dir')()

module.exports = (app, db) => {
  const router = Router()
  controllers['notifications'](router, app, db)

  return router
}
module.exports.controllers = controllers
