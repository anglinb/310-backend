const expect = require('chai').expect
const app = require('../../../')

describe('[model] Category', () => {
  describe('createSlug', () => {
    it('should remove unsafe characters', async () => {
      let cls = app.db.Category
      let slug1 = cls.createSlug('hello-world')
      expect(slug1).to.eql('helloworld')
      let slug2 = cls.createSlug('Hello World!!!!')
      expect(slug2).to.eql('hello-world')
    })
  })
})
