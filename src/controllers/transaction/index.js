const Router = require('express').Router
const controllers = require('require-dir')()

module.exports = (app, db) => {
  const listCreateRouter = Router()
  const batchCreateRouter = Router()
  controllers['create'](listCreateRouter, app, db)
  controllers['create_mult'](batchCreateRouter, app, db)
  const showUpdateRouter = Router()
  Object.keys(controllers).map((key) => {
    if (key !== 'create' && key !== 'create_mult' && key !== 'list') {
      controllers[key](showUpdateRouter, app, db)
    }
  })
  return { listCreateRouter, showUpdateRouter, batchCreateRouter}
}
module.exports.controllers = controllers
