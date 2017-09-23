const home = require('../controllers/home')
const authentication = require('../controllers/authentication')
const budget = require('../controllers/budget')

const autenticationMiddlewareFactory = require('../middlewares/auth')

module.exports = (app, db) => {
  let autenticationMiddleware = autenticationMiddlewareFactory(app, db)
  app.use('/', home(app, db))
  app.use('/', authentication(app, db))
  app.use('/budgets', autenticationMiddleware, budget(app, db))
  // app.use('/budgets', budget(app, db))
}
