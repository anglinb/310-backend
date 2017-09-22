const actions = require('require-dir')()
const router = require('express').Router()

module.exports = (app, db) => {
  actions.authenticate(router, app, db)
}
