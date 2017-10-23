const validate = require('express-validation')
const notificationUpdateValidation = require('../../validators/self/notifications')

module.exports = (router, app, db) => {
  router.get('/notifications',
    async (req, res, next) => {
      let notifications = req.user.get('notifications')
      return res.json(notifications)
    })

  router.put('/notifications',
    validate(notificationUpdateValidation),
    async (req, res, next) => {
      req.user.set('notifications.thresholds', req.body.thresholds)
      req.user.set('notifications.frequency', req.body.frequency)
      await req.user.save()
      res.json(req.user.get('notifications'))
    })
}
