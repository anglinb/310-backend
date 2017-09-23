const request = require('supertest')
const app = require('../../../../')
const testHelpers = require('../../testHelpers')
const expect = require('chai').expect

describe('[controller] budget', () => {
  describe('with authentication', () => {

    let budget
    let user
    beforeEach(async () => {
      let collection = await app.db.Budget.getCollection()
      await collection.remove({})
      user = await testHelpers(app, app.db).createUser()
      budget = new app.db.Budget({ owner_id: user.user.get('_id'), name: 'Budget Name' })
      await budget.save()
    })
    describe.only('create', () => {
      it('should create the category', async () => {
        let categoryReq = {
          name: 'Food & Restaurants',
          amount: 100 * 50
        }
        await request(app)
          .post('/budgets/' +  budget.get('_id').toString())
          .set(...user.auth)
          .send(categoryReq)
          .expect(200)
          .expect(res => {
            expect(res.body.slug).to.eql('food-restaurants')
            expect(res.body.name).to.eql('Food & Restaurants')
          })
        let updatedBudget = await app.db.Budget.findOne({
          _id: budget.get('_id')
        })
        expect(updatedBudget.get('categories').length).to.eql(1)
        expect(updatedBudget.get('categories')[0].name).to.eql('Food & Restaurants')
        expect(updatedBudget.get('categories')[0].slug).to.eql('food-restaurants')
      })
    })
  })
})
