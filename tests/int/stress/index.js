
const request = require('supertest')
const app = require('../../../')
const testHelpers = require('../testHelpers')
const expect = require('chai').expect

describe('[controller] category', () => {
  describe('with authentication', () => {
    describe('update', () => {
      // it('should update the cateogry if it exists and re-generate the slug', async () => {
      //   let budget
      //   let user
      //   let collection = await app.db.Budget.getCollection()
      //   await collection.remove({})
      //   user = await testHelpers(app, app.db).createUser()
      //   budget = new app.db.Budget({ owner_id: user.user.get('_id'), name: 'Budget Name' })
      //   await budget.save()

      //   budget.set('categories', [
      //     new app.db.Category({ name: 'Clothing', slug: 'clothing', amount: 50 * 100 })
      //   ])
      //   await budget.save()
      //   let reqBody = {
      //     name: 'Food',
      //     amount: 60 * 100
      //   }
      //   for(var i =0; i < 10; i++) {
      //     await request(app)
      //       .put('/budgets/' + budget.get('_id').toString() + '/categories/' + 'clothing')
      //       .set(...user.auth)
      //       .send(reqBody)
      //       .expect(200)
      //       .expect(res => {
      //         expect(res.body.slug).to.eql('food')
      //         expect(res.body.name).to.eql('Food')
      //         expect(res.body.amount).to.eql(60 * 100)
      //       })
      //     let updatedBudget = await app.db.Budget.findOne({ _id: budget.get('_id') })
      //     let categories = updatedBudget.get('categories')
      //     expect(categories.length).to.eql(1)
      //     expect(categories[0].get('slug')).to.eql('food')
      //     expect(categories[0].get('name')).to.eql('Food')
      //     expect(categories[0].get('amount')).to.eql(60 * 100)
      //   }
      // })
    })
  })
})