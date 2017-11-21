
const expect = require('chai').expect
const app = require('../../../')

describe('[model] Budget', () => {
  describe('user', () => {
    it('it should get a user when one exits', async () => {
      let user = new app.db.User({})
      await user.save()
      let budget = new app.db.Budget({ owner_ids: [user.get('_id')] })
      await budget.save()
      let budgetOwner = await budget.owner()
      expect(budgetOwner.get('_id')).to.eql(user.get('_id'))
    })
  })
})
