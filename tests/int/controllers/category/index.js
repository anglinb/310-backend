const request = require('supertest')
const app = require('../../../../')
const testHelpers = require('../../testHelpers')
const expect = require('chai').expect

describe('[controller] category', () => {
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
    describe('create', () => {
      it('should create the category and not allow duplicates', async () => {
        let categoryReq = {
          name: 'Food & Restaurants',
          amount: 100 * 50
        }

        await request(app)
          .post('/budgets/' + budget.get('_id').toString() + '/categories')
          .set(...user.auth)
          .send(categoryReq)
          .expect(200)
          .expect(res => {
            expect(res.body.slug).to.eql('food-restaurants')
            expect(res.body.name).to.eql('Food & Restaurants')
          })
        var updatedBudget = await app.db.Budget.findOne({
          _id: budget.get('_id')
        })
        expect(updatedBudget.get('categories').length).to.eql(1)
        expect(updatedBudget.get('categories')[0].get('name')).to.eql('Food & Restaurants')
        expect(updatedBudget.get('categories')[0].get('slug')).to.eql('food-restaurants')

        await request(app)
          .post('/budgets/' + budget.get('_id').toString() + '/categories')
          .set(...user.auth)
          .send(categoryReq)
          .expect(400)

        updatedBudget = await app.db.Budget.findOne({
          _id: budget.get('_id')
        })
        expect(updatedBudget.get('categories').length).to.eql(1)
        expect(updatedBudget.get('categories')[0].get('name')).to.eql('Food & Restaurants')
        expect(updatedBudget.get('categories')[0].get('slug')).to.eql('food-restaurants')
      })

      it('should create the category and not allow duplicates', async () => {
        let newBudget = new app.db.Budget({
          name: 'New Budget',
          owner_id: user.user.get('_id'),
          categories: [
            new app.db.Category({ name: 'Food & Restaurants', slug: 'food-restaurants', amount: 50 * 100 }),
            new app.db.Category({ name: 'Rent', slug: 'rent', amount: 500 * 100 })
          ]
        })
        await newBudget.save()
        let categoryReq = {
          name: 'Clothing',
          amount: 100 * 50
        }

        await request(app)
          .post('/budgets/' + newBudget.get('_id').toString() + '/categories')
          .set(...user.auth)
          .send(categoryReq)
          .expect(200)
          .expect(res => {
            expect(res.body.slug).to.eql('clothing')
            expect(res.body.name).to.eql('Clothing')
          })
        let updatedBudget = await app.db.Budget.findOne({
          _id: newBudget.get('_id')
        })
        let categories = updatedBudget.get('categories')
        expect(categories[0].get('slug')).to.eql('food-restaurants')
        expect(categories[1].get('slug')).to.eql('rent')
        expect(categories[2].get('slug')).to.eql('clothing')
      })
    })

    describe('delete', () => {
      it('should delete the category when it exists', async () => {
        budget.set('categories', [
          new app.db.Category({ name: 'Clothing', slug: 'clothing', amount: 50 * 100 })
        ])
        await budget.save()
        await request(app)
          .delete('/budgets/' + budget.get('_id').toString() + '/categories/' + 'clothing')
          .set(...user.auth)
          .expect(204)
        let updatedBudget = await app.db.Budget.findOne({ _id: budget.get('_id') })
        expect(updatedBudget.get('categories').length).to.eql(0)
      })

      it('should 404 when the category does not exists', async () => {
        await request(app)
          .delete('/budgets/' + budget.get('_id').toString() + '/categories/' + 'clothing')
          .set(...user.auth)
          .expect(404)
      })
    })

    describe('update', () => {
      it('should update the cateogry if it exists and re-generate the slug', async () => {
        budget.set('categories', [
          new app.db.Category({ name: 'Clothing', slug: 'clothing', amount: 50 * 100 })
        ])
        await budget.save()
        let reqBody = {
          name: 'Food',
          amount: 60 * 100
        }
        await request(app)
          .put('/budgets/' + budget.get('_id').toString() + '/categories/' + 'clothing')
          .set(...user.auth)
          .send(reqBody)
          .expect(200)
          .expect(res => {
            expect(res.body.slug).to.eql('food')
            expect(res.body.name).to.eql('Food')
            expect(res.body.amount).to.eql(60 * 100)
          })
        let updatedBudget = await app.db.Budget.findOne({ _id: budget.get('_id') })
        let categories = updatedBudget.get('categories')
        expect(categories.length).to.eql(1)
        expect(categories[0].get('slug')).to.eql('food')
        expect(categories[0].get('name')).to.eql('Food')
        expect(categories[0].get('amount')).to.eql(60 * 100)
      })

      it('should 404 when the category does not exists', async () => {
        await request(app)
          .delete('/budgets/' + budget.get('_id').toString() + '/categories/' + 'clothing')
          .set(...user.auth)
          .expect(404)
      })
    })
  })
})
