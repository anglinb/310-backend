const request = require('supertest')
const expect = require('chai').expect
const app = require('../../../../')
const jwt = require('jsonwebtoken')

describe('[controller] authentication', () => {
  beforeEach(async () => {
    let conn = await app.db.mongo.connection()
    return conn.dropDatabase()
  })
  describe('without existing user', () => {
    it('should create a new user', async () => {
      await request(app)
        .post('/authenticate')
        .send({ username: 'banglin@usc.edu', password: '12345' })
        .expect(200)
        .expect(res => {
          expect(res.body.status).to.eql('ok')
        })
      let user = await app.db.User.findOne({ username: 'banglin@usc.edu' })
      expect(user).not.to.be.a('null')
      expect(await user.checkPassword('12345')).to.eql(true)
    })
  })

  describe('with an existing user', () => {
    let user
    beforeEach(async () => {
      let conn = await app.db.mongo.connection()
      await conn.dropDatabase()
      user = new app.db.User({ username: 'banglin@usc.edu' })
      await user.setPassword('12345')
      await user.save()
    })

    it('should fail if the password is wrong already', async () => {
      await request(app)
        .post('/authenticate')
        .send({ username: 'banglin@usc.edu', password: '54321' })
        .expect(401)
        .expect(res => {
          expect(Object.keys(res.body)).to.include('error')
        })
    })

    it('should succeed if the password is correct', async () => {
      await request(app)
        .post('/authenticate')
        .send({ username: 'banglin@usc.edu', password: '12345' })
        .expect(200)
        .expect(res => {
          expect(res.body.status).to.eql('ok')
          let payload = jwt.verify(res.body.authentication, process.env.JWT_SECRET)
          expect(payload._id).to.eql(user.get('_id').toString())
        })
    })
  })
})
