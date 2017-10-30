const Router = require('express').Router
const controllers = require('require-dir')()

module.exports = (app, db) => {
  const listCreateRouter = Router()
  controllers['create'](listCreateRouter, app, db)

  const showUpdateRouter = Router()
  Object.keys(controllers).map((key) => {
    if (key !== 'create') {
      controllers[key](showUpdateRouter, app, db)
    }
  })
  return { showUpdateRouter, listCreateRouter }
}
module.exports.controllers = controllers
