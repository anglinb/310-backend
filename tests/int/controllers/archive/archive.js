const request = require('supertest')
const app = require('../../../../')
const testHelpers = require('../../testHelpers')
const expect = require('chai').expect

describe('[controller] archive', () => {
  describe('with authentication', () => {
    let user
    let budget
    beforeEach(async () => {
      user = await testHelpers(app, app.db).createUser()
      budget = new app.db.Budget({
        name: 'Budget 1',
        owner_id: user.user.get('_id'),
        resetDate: 5,
        resetType: 'MONTH',
        categories: []
      })
      await budget.save()
    })
    describe('with no budgets', () => {
      it('should return an empty array', async () => {
        await request(app)
          .get(`/budgets/${budget.get('_id').toString()}/archives`)
          .set(...user.auth)
          .expect(200)
          .expect(res => {
            expect(res.body).to.eql([])
          })
      })
    })

    describe('with budgets', () => {
      it('should the budgets sorted by created date', async () => {
        let budgetArchive1 = new app.db.BudgetArchive({ name: 'Budget 1', owner_id: user.user.get('_id'), budget_id: budget.get('_id') })
        await budgetArchive1.save()

        let secondBudget = new app.db.Budget()
        await secondBudget.save()

        let budgetArchiveNotMine = new app.db.BudgetArchive({ name: 'Budget NOt mine', owner_id: user.user.get('_id'), budget_id: secondBudget.get('_id') })
        await budgetArchiveNotMine.save()

        let budgetArchive2 = new app.db.BudgetArchive({ name: 'Budget 2', owner_id: user.user.get('_id'), budget_id: budget.get('_id') })
        await budgetArchive2.save()

        await request(app)
          .get(`/budgets/${budget.get('_id').toString()}/archives`)
          .set(...user.auth)
          .expect(200)
          .expect(res => {
            expect(res.body[0].name).to.eql('Budget 2')
            expect(res.body[1].name).to.eql('Budget 1')
            expect(res.body.length).to.eql(2)
          })
      })
    })
  })
})
