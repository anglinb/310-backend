const request = require('supertest')
const app = require('../../../../')
const testHelpers = require('../../testHelpers')
const expect = require('chai').expect

describe('[controller] sync', () => {
    let user
    let budget
    beforeEach(async () => {
      user = await testHelpers(app, app.db).createUser()
      budget = new app.db.Budget({
        name: 'Budget 1',
        owner_ids: [user.user.get('_id')],
        resetDate: 5,
        resetType: 'MONTH',
        categories: []
      })
      await budget.save()
    })
    describe('invites', () => {
      it('should show no invites if none exist', async () => {
        await request(app)
          .get('/sync')
          .set(...user.auth)
          .expect(200)
          .expect(res => {
            expect(res.body.invites).to.eql([])
          })
      })
      it('should show invites if they exist', async () => {
        let invite = new app.db.Invite({
          invitee_id: user.user.get('_id'),
          inviter_id: '2093280',
          budget_id: budget.get('_id')
        })
        await invite.save()
        await request(app)
          .get('/sync')
          .set(...user.auth)
          .expect(200)
          .expect(res => {
            expect(res.body.invites.length).to.eql(1)
            expect(res.body.invites[0].invitee_id).to.eql(user.user.get('_id').toString())
            expect(res.body.invites[0].inviter_id).to.eql('2093280')
            expect(res.body.invites[0].budget_id).to.eql(budget.get('_id').toString())
          })
      })
    })
})
