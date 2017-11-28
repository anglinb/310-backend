
const Router = require('express').Router
const controllers = require('require-dir')()

module.exports = (app, db) => {
  let router = Router()
  controllers['upload'](router, app, db)
  return { router }
}