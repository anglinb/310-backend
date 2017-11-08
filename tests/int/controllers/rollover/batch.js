const request = require('supertest')
const app = require('../../../../')
const testHelpers = require('../../testHelpers')
const expect = require('chai').expect

describe('[controller] rollover', () => {
  describe('batch', () => {
    let user
    let budget
    beforeEach(async () => {
      user = await testHelpers(app, app.db).createUser()
      budget = new app.db.Budget({
        name: 'Budget 1',
        owner_id: user.user.get('_id'),
        resetDate: 5,
        resetType: 'MONTH',
        categories: [
          {
            name: 'Food',
            slug: 'food',
            rolloverAmount: 50,
            rolloverStatus: 'UNKNOWN',
            transactions: []
          }
        ]
      })
      await budget.save()
    })
    describe('with a single budget', () => {
      it('it should update the category correctly ', async () => {
        await request(app)
          .post(`/budgets/${budget.get('_id').toString()}/rollover/_batch`)
          .send({
            data: [
              {
                categorySlug: 'food',
                rolloverStatus: 'ACTIVE'
              },
              {
                categorySlug: 'ins',
                rolloverStatus: 'ACTIVE'
              }
            ]
          })
          .set(...user.auth)
          .expect(200)
          .expect(res => {
            // console.log(res.body.errors[0].messages)
            expect(res.body._id).to.eql(budget.get('_id').toString())
            expect(res.body.categories[0].rolloverStatus).to.eql('ACTIVE')
          })
        await request(app)
          .post(`/budgets/${budget.get('_id').toString()}/rollover/_batch`)
          .send({
            data: [
              {
                categorySlug: 'food',
                rolloverStatus: 'INACTIVE'
              }
            ]
          })
          .set(...user.auth)
          .expect(200)
          .expect(res => {
            expect(res.body._id).to.eql(budget.get('_id').toString())
            expect(res.body.categories[0].rolloverStatus).to.eql('INACTIVE')
          })
      })
    })
  })
})
