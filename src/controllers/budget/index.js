const Router = require('express').Router
const controllers = require('require-dir')()

module.exports = (app, db) => {
  const listCreateRouter = Router()
  controllers['create'](listCreateRouter, app, db)
  controllers['list'](listCreateRouter, app, db)

  const showUpdateRouter = Router()
  Object.keys(controllers).map((key) => {
    if (key !== 'create' && key !== 'list') {
      controllers[key](showUpdateRouter, app, db)
    }
  })
  return { listCreateRouter, showUpdateRouter }
}
module.exports.controllers = controllers
