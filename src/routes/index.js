const home = require('../controllers/home')
const authentication = require('../controllers/authentication')
const budget = require('../controllers/budget')
const category = require('../controllers/category')
const transaction = require('../controllers/transaction')
const archive = require('../controllers/archive')
const selfCtrl = require('../controllers/self')
const debugCtrl = require('../controllers/debug')
const rollover = require('../controllers/rollover')

const autenticationMiddlewareFactory = require('../middlewares/auth')
const setBudgetMiddlewareFactory = require('../middlewares/setBudget')
const setBudgetAndAuthMiddlewareFactory = require('../middlewares/authBudgetNoUser')
const setCategoryMiddlewareFactory = require('../middlewares/setCategory')
const setTransactionMiddlewareFactory = require('../middlewares/setTransaction')

module.exports = (app, db) => {
  let autenticationMiddleware = autenticationMiddlewareFactory(app, db)
  let setBudgetMiddleware = setBudgetMiddlewareFactory(app, db)
  let setBudgetNoUserMiddleware = setBudgetAndAuthMiddlewareFactory(app, db)
  let setCategoryMiddleware = setCategoryMiddlewareFactory(app, db)
  let setTransactionMiddleware = setTransactionMiddlewareFactory(app, db)
  app.use('/', home(app, db))
  app.use('/', authentication(app, db))

  const transactionController = transaction(app, db)
  const budgetController = budget(app, db)
  app.use('/budgets',
    autenticationMiddleware,
    budgetController.listCreateRouter)

  app.use('/budgets/:budgetId',
    autenticationMiddleware,
    setBudgetMiddleware,
    budgetController.showUpdateRouter)


  app.use('/budgets_batch',
        autenticationMiddleware,
        transactionController.batchCreateRouter)

  const selfController = selfCtrl(app, db)
  app.use('/self',
    autenticationMiddleware,
    selfController)

  const archiveController = archive(app, db)
  app.use('/budgets/:budgetId/archives',
    // autenticationMiddleware,
    // setBudgetMiddleware,
    setBudgetNoUserMiddleware,
    archiveController.listCreateRouter)

  const categoryController = category(app, db)
  app.use('/budgets/:budgetId/categories',
    // autenticationMiddleware,
    // setBudgetMiddleware,
    setBudgetNoUserMiddleware,
    categoryController.listCreateRouter)

  const rolloverController = rollover(app, db)
  app.use('/budgets/:budgetId/rollover',
    // autenticationMiddleware,
    // setBudgetMiddleware,
    setBudgetNoUserMiddleware,
    rolloverController.listCreateRouter
  )

  app.use('/budgets/:budgetId/categories/:categorySlug',
    // autenticationMiddleware,
    // setBudgetMiddleware,
    setBudgetNoUserMiddleware,
    setCategoryMiddleware,
    categoryController.showUpdateRouter)

  app.use('/budgets/:budgetId/categories/:categorySlug/transactions/:transactionId',
      autenticationMiddleware,
      setBudgetMiddleware,
      setCategoryMiddleware, setTransactionMiddleware,
      transactionController.showUpdateRouter)

  app.use('/budgets/:budgetId/categories/:categorySlug/transactions',
        autenticationMiddleware,
        setBudgetMiddleware,
        setCategoryMiddleware,
        transactionController.listCreateRouter)

  if (process.env.NODE_ENV === 'development') {
    let debugController = debugCtrl(app, db)
    app.use('/_debug', debugController)
  }
}
