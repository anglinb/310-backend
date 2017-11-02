const Router = require('express').Router
const jwt = require('../../helpers/jwt')

let sendJWT = (user, res) => {
  let token = jwt.create({_id: user.get('_id')})
  res.json({ status: 'ok', authentication: token })
}

module.exports = (app, db) => {
  const router = Router()
  router.post('/user/reset', async(req, res, next) => {
    console.log('REQ OBYD', req.body)
    let username = req.body.username.toLowerCase()
    let user = await db.User.findOne({ username })
    if (user) {
      await user.remove()
    }
    let newUser = new db.User({
      username,
      notifications: {
        frequency: 'DAILY',
        thresholds: [50, 80]
      }
    })
    await newUser.setPassword(req.body.password || '12345')
    await newUser.save()
    await newUser.createDefaultBudget()
    sendJWT(newUser, res)
  })
  return router
}
