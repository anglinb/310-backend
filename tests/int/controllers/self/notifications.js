const request = require('supertest')
const expect = require('chai').expect
const testHelpers = require('../../testHelpers')
const app = require('../../../../')

describe.only('[controller] self notifications', () => {

    let user
    beforeEach(async () => {
      let conn = await app.db.mongo.connection()
      await conn.dropDatabase()
      user = await testHelpers(app, app.db).createUser()
      user.user.set('notifications', {
        frequency: 'DAILY',
        thresholds: [50, 80],
      })
      await user.user.save()
    })
  it('should respond with user notifications settings', async () => {
    await request(app)
      .get('/self/notifications')
      .set(...user.auth)
      .expect(200)
      .expect(res => {
        expect(res.body.frequency).to.eql('DAILY')
        expect(res.body.thresholds).to.eql([50, 80])
      })
  })

  it('should let you update your settings', async () => {
    let req = {
      frequency: 'NEVER',
      thresholds: [60, 90, 100]
    }
    await request(app)
      .put('/self/notifications')
      .set(...user.auth)
      .send(req)
      .expect(200)
      .expect(res => {
        expect(res.body.frequency).to.eql('NEVER')
        expect(res.body.thresholds).to.eql([60, 90, 100])
      })
  })
})
