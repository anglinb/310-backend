const validationMiddleware = require('../../../middlewares/validation')
const { check, validationResult } = require('express-validator/check')
const { matchedData } = require('express-validator/filter')

const jwt = require('../../../helpers/jwt')

let sendJWT = (user, res) => {
  let token = jwt.create({_id: user._id})
  res.sendStatus(200)
  res.json({ status: 'ok', authentication: token })
}

module.exports = (router, app, db) => {
  router.post('/authenticate', [
    check('username')
      .isEmail().withMessage('must be an email')
      .trim()
      .normalizeEmail(),
    check('password')
      .isLength({ min: 5})
  ],
  validationMiddleware,
  async (req, res, next) => {
    const data = matchedData(req);
    let user = await db.User.findOne({ where: { username: data.username } })
    if (user) {
      let success = await user.checkPassword(data.password)
      if (!success) {
        res.sendStatus(401)
        res.json({ error: { msg: 'Invalid password' , error: 'invalid_password' } })
        return;
      } else {
        sendJWT(user, res)
        return
      }
    } else {
      let newUser = new User({ username })
      await usernewUser.setPassword(data.password)
      await usernewUser.save()
      sendJWT(usernewUser, res)
      return
    }
  })
}
