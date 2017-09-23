const home = require('../controllers/home')
const authentication = require('../controllers/authentication')
const budget = require('../controllers/budget')
const category = require('../controllers/category')

const autenticationMiddlewareFactory = require('../middlewares/auth')
const setBudgetMiddlewareFactory = require('../middlewares/setBudget')
const setCategoryMiddlewareFactory = require('../middlewares/setCategory')

module.exports = (app, db) => {
  let autenticationMiddleware = autenticationMiddlewareFactory(app, db)
  let setBudgetMiddleware = setBudgetMiddlewareFactory(app, db)
  let setCategoryMiddleware = setCategoryMiddlewareFactory(app, db)

  app.use('/', home(app, db))
  app.use('/', authentication(app, db))

  const budgetController = budget(app, db)
  app.use('/budgets',
    autenticationMiddleware,
    budgetController.listCreateRouter)

  app.use('/budgets/:budgetId',
    autenticationMiddleware,
    setBudgetMiddleware,
    budgetController.showUpdateRouter)

  const categoryController = category(app, db)
  app.use('/budgets/:budgetId/categories',
    autenticationMiddleware,
    setBudgetMiddleware,
    categoryController.listCreateRouter)

  app.use('/budgets/:budgetId/categories/:categorySlug',
    autenticationMiddleware,
    setBudgetMiddleware,
    setCategoryMiddleware,
    categoryController.showUpdateRouter)
}
