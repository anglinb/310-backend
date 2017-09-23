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
  describe.only('budgets', () => {
    it('should return budgets associated with the user', async () => {
      let user = new app.db.User({})
      await user.save()
      var budgets = await user.budgets()
      expect(budgets.length).to.eql(0)
      let budget1 = new app.db.Budget({ owner_id: user.get('_id'), name: 'Budget 1' })
      await budget1.save()
      budgets = await user.budgets()
      expect(budgets.length).to.eql(1)
      let budget2 = new app.db.Budget({ owner_id: user.get('_id'), name: 'Budget 2' })
      await budget2.save()
      budgets = await user.budgets()
      expect(budgets.length).to.eql(2)
    })
  })
})
