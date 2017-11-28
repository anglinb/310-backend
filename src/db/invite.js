const { Model } = require('mongorito')

/*
 * Invite
 *
 * Object used to represent an invite to collaborate on a budget
 * inviter_id - ObjectId - Id of the person who is inviting
 * invitee_id - ObjectId - Id of the person getting invited
 * budget_id - ObjectId - Id of the budget that the user is getting invited to
 */

class Invite extends Model {
}

module.exports = Invite
