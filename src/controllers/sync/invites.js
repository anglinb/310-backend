module.exports = (app, db) => {
  return async (req) => {
    let invites = await db.Invite.find({ invitee_id: req.user.get('_id') })
    return invites.map((invite) => { return invite.toJSON() })
  }
}