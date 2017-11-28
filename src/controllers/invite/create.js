const mongodb = require('mongodb')
const validate = require('express-validation')
const inviteCreateValidation = require('../../validators/invite/create')

module.exports = (router, app, db, setBudgetNoAuthMiddleware) => {
  router.post('/',
    validate(inviteCreateValidation),
    async (req, res, next) => {
      let invitee = await db.User.findOne({ username: req.body.username.toLowerCase() })
      // let invitee = await db.User.findOne({ username: req.body.username })
      if (!invitee) {
        res.json({ status: 'failed'})
        return
      }

      let inviteBody =  {
        invitee_id: invitee.get('_id'),
        inviter_id: req.user.get('_id'),
        budget_id: req.budget.get('_id'),
      }
      let invite = await db.Invite.findOne(inviteBody)
      if (!invite) {
        invite = new db.Invite(Object.assign({},
          inviteBody, 
          {
            budget_name: req.budget.get('name'),
            inviter_username: req.user.get('username'),
          }
        ))
        await invite.save()
      }
      return res.json(invite.toJSON())
    })
}
