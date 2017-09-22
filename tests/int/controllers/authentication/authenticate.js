const request = require('supertest');
const expect = require('chai').expect
const app = require('../../../../')

describe('[controller] authentication', () => {
  before(async () => {
    return app.db.mongo._connection.dropDatabase()
  })
  it.only('should create a new user', async () => {
    await request(app)
      .post('/authenticate')
      .send({ username: 'banglin@usc.edu', password: '12345'})
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(res => {
        expect(res.body.status).to.eql('ok')
      })
  })
})

