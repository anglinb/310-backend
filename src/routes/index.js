const home = require('../controllers/home')
const authentication = require('../controllers/authentication')

module.exports = (app, db) => {
  app.use('/', home(app, db))
  app.use('/', authentication(app, db))
}
