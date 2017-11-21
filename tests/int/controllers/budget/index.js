const request = require('supertest')
const app = require('../../../../')
const testHelpers = require('../../testHelpers')
const expect = require('chai').expect

describe('[controller] budget', () => {
  describe('with authentication', () => {
    let user
    let budget
    beforeEach(async () => {
      let collection = await app.db.Budget.getCollection()
      await collection.remove({})
      user = await testHelpers(app, app.db).createUser()
      budget = new app.db.Budget({ name: 'Budget 1', owner_ids: [user.user.get('_id')]})
      await budget.save()
    })
    describe('update', () => {
      it('should update the budget', async () => {
        let budgetReq = { name: 'Budget 1 Updated' }
        await request(app)
          .put('/budgets/' + budget.get('_id').toString())
          .set(...user.auth)
          .send(budgetReq)
          .expect(200)
          .expect(res => {
            expect(res.body.owner_ids[0]).to.eql(user.user.get('_id').toString())
            expect(res.body.name).to.eql('Budget 1 Updated')
          })
        let updatedBudget = await app.db.Budget.findOne({
          name: 'Budget 1 Updated',
          owner_ids: [user.user.get('_id')]
        })
        expect(updatedBudget).to.not.be.a('null')
      })
    })

    describe('delete', () => {
      it('should delete the budget', async () => {
        await request(app)
          .delete('/budgets/' + budget.get('_id').toString())
          .set(...user.auth)
          .expect(200)
        let updatedBudget = await app.db.Budget.findOne({
          _id: budget.get('_id')
        })
        expect(updatedBudget).to.be.a('null')
      })
    })

    describe('show', () => {
      it('should show budget', async () => {
        await request(app)
          .get('/budgets/' + budget.get('_id').toString())
          .set(...user.auth)
          .expect(200)
          .expect(res => {
            expect(res.body.name).to.eql('Budget 1')
          })
      })

      it('should show nested categories', async () => {
        budget.set('categories', [
          new app.db.Category({ name: 'Food', slug: 'food', amount: 50 * 100 })
        ])
        await budget.save()
        await request(app)
          .get('/budgets/' + budget.get('_id').toString())
          .set(...user.auth)
          .expect(200)
          .expect(res => {
            expect(res.body.name).to.eql('Budget 1')
            expect(res.body.categories.length).to.eql(1)
            expect(res.body.categories[0].slug).to.eql('food')
            expect(res.body.categories[0].name).to.eql('Food')
            expect(res.body.categories[0].amount).to.eql(50 * 100)
          })
      })
    })
  })
})
