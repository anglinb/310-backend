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
})
