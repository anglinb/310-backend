const Router = require('express').Router
const controllers = require('require-dir')()

module.exports = (app, db) => {
  const listCreateRouter = Router()
  controllers['batch'](listCreateRouter, app, db)

  return { listCreateRouter }
}
module.exports.controllers = controllers
