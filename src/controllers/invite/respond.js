const mongodb = require('mongodb')
const validate = require('express-validation')
const inviteRespondValidation = require('../../validators/invite/respond')

module.exports = (router, app, db) => {
  router.post('/respond',
    validate(inviteRespondValidation),
    async (req, res, next) => {

      // Look for any invites for this user to this repo
      let query =  {
        invitee_id: req.user.get('_id'),
        budget_id: req.budget.get('_id'),
      }
      let invites = await db.Invite.find(query)
      if (invites.length === 0) {
        res.json({ status: 'failed' })
        return 
      }

      // If we've accepted add us
      if (req.body.accept === true) {
        let ownerIds = req.budget.get('owner_ids')
        ownerIds.push(req.user.get('_id'))

        // Remove duplicates & sets owner_ids
        req.budget.set('owner_ids', ownerIds.filter((item, pos) => {
          return ownerIds.indexOf(item) === pos
        }))
        await req.budget.save()
      }

      // Delete all the outstanding invites
      Promise.all(invites.map(async (invite) => {
        return invite.remove()
      }))

      res.json({ status: 'ok' })
    })
}
