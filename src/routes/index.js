const home = require('../controllers/home')
const authentication = require('../controllers/authentication')
const budget = require('../controllers/budget')
const category = require('../controllers/category')


const autenticationMiddlewareFactory = require('../middlewares/auth')
const setBudgetMiddlewareFactory = require('../middlewares/setBudget')

module.exports = (app, db) => {
  let autenticationMiddleware = autenticationMiddlewareFactory(app, db)
  let setBudgetMiddleware = setBudgetMiddlewareFactory(app, db)

  app.use('/', home(app, db))
  app.use('/', authentication(app, db))
  app.use('/budgets', autenticationMiddleware, budget(app, db))
  app.use('/budgets/:budgetId/', autenticationMiddleware, setBudgetMiddleware, category)
}
