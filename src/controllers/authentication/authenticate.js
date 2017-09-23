const validate = require('express-validation')
const authenticationValidation = require('../../validators/authentication/authentication')
const jwt = require('../../helpers/jwt')

let sendJWT = (user, res) => {
  let token = jwt.create({_id: user.get('_id')})
  res.json({ status: 'ok', authentication: token })
}

module.exports = (router, app, db) => {
  router.post('/authenticate',
  validate(authenticationValidation),
  async (req, res, next) => {
    const data = { username: req.body.username, password: req.body.password }
    let user = await db.User.findOne({ username: data.username })
    if (user) {
      let success = await user.checkPassword(data.password)
      if (!success) {
        res.status(401).json({ error: { msg: 'Invalid password', error: 'invalid_password' } })
      } else {
        sendJWT(user, res)
      }
    } else {
      let newUser = new db.User({ username: data.username })
      await newUser.setPassword(data.password)
      await newUser.save()
      sendJWT(newUser, res)
    }
  })
}
