const path = require('path')
const request = require('supertest')
const expect = require('chai').expect
const testHelpers = require('../../testHelpers')
const app = require('../../../../')

describe('[controller] receipts', () => {
  let user
  let budget
  beforeEach(async () => {
    let collection = await app.db.Budget.getCollection()
    await collection.remove({})
    user = await testHelpers(app, app.db).createUser()
    budget = new app.db.Budget({ owner_ids: [user.user.get('_id')], name: 'Budget Name' })
    await budget.save()
  })
  describe('upload', () => {
    it('should ', async () => {
      let projectRoot = app.get('projectRoot')
      let filepath = path.join(app.get('projectRoot'), 'tests/int/controllers/receipt', 'test-receipt.jpg')
      await request(app)
        .post('/receipts/upload')
        .set(...user.auth)
        .attach('receipt', filepath)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
          expect(res.body.result.amount).to.eql('54.50')
          expect(res.body.result.date).to.eql('2007-07-30')
        })
    }).timeout(5000)
  })
})
