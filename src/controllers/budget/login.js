const validationMiddleware = require('../../../middlewares/validation')
const { check, validationResult } = require('express-validator/check')
const { matchedData } = require('express-validator/filter')

module.exports = (router, app, db) => {
  router.post('/budgets', [
    check('username')
      .isEmail().withMessage('must be an email')
      .trim()
      .normalizeEmail(),
    check('password')
      .isLength({ min: 5})
  ],
  validationMiddleware,
  (req, res, next) => {
    

  })
}
