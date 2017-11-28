const request = require('supertest')
const app = require('../../../../')
const testHelpers = require('../../testHelpers')
const expect = require('chai').expect

describe('[controller] create', () => {
    let user
    let secondUser
    let budget
    beforeEach(async () => {
      user = await testHelpers(app, app.db).createUser()
      secondUser = await testHelpers(app, app.db).createUser()
      budget = new app.db.Budget({
        name: 'Budget 1',
        owner_ids: [user.user.get('_id')],
        resetDate: 5,
        resetType: 'MONTH',
        categories: []
      })
      await budget.save()
    })
    it('should create a new invite', async () => {
      let payload = {
        username: secondUser.user.get('username')
      }
      await request(app)
        .post(`/budgets/${budget.get('_id')}/invites`)
        .set(...user.auth)
        .send(payload)
        .expect(200)
        .expect(res => {
          expect(res.body.inviter_id).to.eql(user.user.get('_id').toString())
          expect(res.body.invitee_id).to.eql(secondUser.user.get('_id').toString())
          expect(res.body.budget_id).to.eql(budget.get('_id').toString())
          expect(res.body.budget_name).to.eql('Budget 1')
          expect(res.body.inviter_username).to.eql(user.user.get('username'))
        })

      let createdInvites = await app.db.Invite.find({
        inviter_id: user.user.get('_id'),
        invitee_id: secondUser.user.get('_id'),
        budget_id: budget.get('_id'),
      })
      expect(createdInvites.length).to.eql(1)

      // Send the request again 
      await request(app)
        .post(`/budgets/${budget.get('_id')}/invites`)
        .set(...user.auth)
        .send(payload)
        .expect(200)
        .expect(res => {
          expect(res.body.inviter_id).to.eql(user.user.get('_id').toString())
          expect(res.body.invitee_id).to.eql(secondUser.user.get('_id').toString())
          expect(res.body.budget_id).to.eql(budget.get('_id').toString())
          expect(res.body.budget_name).to.eql('Budget 1')
          expect(res.body.inviter_username).to.eql(user.user.get('username'))
        })

      // Shouldn't duplicate
      createdInvites = await app.db.Invite.find({
        inviter_id: user.user.get('_id'),
        invitee_id: secondUser.user.get('_id'),
        budget_id: budget.get('_id'),
      })
      expect(createdInvites.length).to.eql(1)
    })
})
