const request = require('supertest')
const app = require('../../../../')
const testHelpers = require('../../testHelpers')
const expect = require('chai').expect

describe.only('[controller] respond', () => {
    let user
    let secondUser
    let budget
    beforeEach(async () => {
      user = await testHelpers(app, app.db).createUser()
      secondUser = await testHelpers(app, app.db).createUser()
      budget = new app.db.Budget({
        name: 'Budget 1',
        owner_ids: [secondUser.user.get('_id')],
        resetDate: 5,
        resetType: 'MONTH',
        categories: []
      })
      await budget.save()
    })
    it('should only work w/ an invite', async () => {

      // First we don't have an invite
      let payload = {
        accept: true
      }
      await request(app)
        .post(`/budgets/${budget.get('_id')}/invites/respond`)
        .set(...user.auth)
        .send(payload)
        .expect(200)
        .expect(res => {
          expect(res.body.status).to.eql('failed')
        })

      // The owners shouldn't change
      let updatedBudget = await app.db.Budget.findOne({ _id: budget.get('_id') })
      expect(updatedBudget.get('owner_ids')).to.eql(budget.get('owner_ids'))

      let invite = new app.db.Invite({
        invitee_id: user.user.get('_id'),
        inviter_id: secondUser.user.get('_id'),
        budget_id: budget.get('_id'),
      })
      await invite.save()

      // Send the request again 
      await request(app)
        .post(`/budgets/${budget.get('_id')}/invites/respond`)
        .set(...user.auth)
        .send(payload)
        .expect(200)
        .expect(res => {
          expect(res.body.status).to.eql('ok')
        })

      // It should have removed the invite and updated the owners_ids
      let removedInvite = await app.db.Invite.findOne({ _id: invite.get('_id') })
      expect(removedInvite).to.be.a('null')

      updatedBudget = await app.db.Budget.findOne({ _id: budget.get('_id') })
      expect(updatedBudget.get('owner_ids').length).to.eql(2)
    })
})
