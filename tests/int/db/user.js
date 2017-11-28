const expect = require('chai').expect
const app = require('../../../')

describe('[model] User', () => {
  describe('password', () => {
    it('set a password and verify if same', async () => {
      let user = new app.db.User({})
      await user.setPassword('12345')
      let success = await user.checkPassword('12345')
      expect(success).to.eql(true)
    })

    it('set a password and fail if not same', async () => {
      let user = new app.db.User({})
      await user.setPassword('12345')
      let success = await user.checkPassword('54321')
      expect(success).to.eql(false)
    })
  })
  describe('budgets', () => {
    it('should return budgets associated with the user', async () => {
      let user = new app.db.User({})
      await user.save()
      var budgets = await user.budgets()
      expect(budgets.length).to.eql(0)
      let budget1 = new app.db.Budget({ owner_ids: [user.get('_id')], name: 'Budget 1' })
      await budget1.save()
      budgets = await user.budgets()
      expect(budgets.length).to.eql(1)
      let budget2 = new app.db.Budget({ owner_ids: [user.get('_id')], name: 'Budget 2' })
      await budget2.save()
      budgets = await user.budgets()
      expect(budgets.length).to.eql(2)
    })
  })

  describe('createDefaultBudget', () => {
    it('should create a default budget w/ default categories', async () => {
      let user = new app.db.User({})
      await user.save()
      await user.createDefaultBudget()
      let budgets = await user.budgets()
      expect(budgets.length).to.eql(1)
      expect(budgets[0].get('name')).to.eql('Personal Expenses')
      expect(budgets[0].get('categories').length).to.eql(3)
    })
  })

  describe('getBudgetIfOwner', () => {
    let user
    let budget
    beforeEach(async () => {
      user = new app.db.User({})
      await user.save()
      budget = new app.db.Budget({ owner_ids: [user.get('_id')], name: 'Budget 1' })
      await budget.save()
    })

    it('should get budget when the owner is correct', async () => {
      let ownedBudget = await user.getBudgetIfOwner(budget.get('_id').toString())
      expect(ownedBudget.get('name')).to.eql('Budget 1')
    })

    it.only('should get budget when there are multiple owners', async () => {
      budget.set('owner_ids', [user.get('_id'), '09320923093209'])
      await budget.save()
      let ownedBudget = await user.getBudgetIfOwner(budget.get('_id').toString())
      expect(ownedBudget.get('name')).to.eql('Budget 1')
    })

    it('should return null when the owner is not correct', async () => {
      let otherUser = new app.db.User({})
      await otherUser.save()
      let otherBudget = new app.db.Budget({ owner_ids: [otherUser.get('_id')], name: 'Budget not mine' })
      await otherBudget.save()
      let ownedBudget = await user.getBudgetIfOwner(otherBudget.get('_id').toString())
      expect(ownedBudget).to.be.a('null')
    })
  })
})
