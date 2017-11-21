const request = require('supertest')
const app = require('../../../../')
const testHelpers = require('../../testHelpers')
const expect = require('chai').expect

describe('[controller] budget', () => {
  describe('with authentication', () => {
    describe('with no budgets', () => {
      it('should return an empty array', async () => {
        let user = await testHelpers(app, app.db).createUser()
        await request(app)
          .get('/budgets')
          .set(...user.auth)
          .expect(200)
          .expect(res => {
            expect(res.body).to.eql([])
          })
      })
    })

    describe('with budgets', () => {
      it('should the budgets sorted by created date', async () => {
        let user = await testHelpers(app, app.db).createUser()
        let budget1 = new app.db.Budget({ name: 'Budget 1', owner_ids: [user.user.get('_id')] })
        await budget1.save()
        let user2 = new app.db.User({})
        await user2.save()
        let budgetNotMine = new app.db.Budget({ name: 'Budget NOt mine', owner_ids: [user2.get('_id')] })
        await budgetNotMine.save()
        let budget2 = new app.db.Budget({ name: 'Budget 2', owner_ids: [user.user.get('_id')] })
        await budget2.save()

        await request(app)
          .get('/budgets')
          .set(...user.auth)
          .expect(200)
          .expect(res => {
            expect(res.body[0].name).to.eql('Budget 1')
            expect(res.body[1].name).to.eql('Budget 2')
            expect(res.body.length).to.eql(2)
          })
      })
    })
  })
})
