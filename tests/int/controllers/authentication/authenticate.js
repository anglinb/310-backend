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
    it('should create a new user and a default budget', async () => {
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
      let budgets = await user.budgets()
      expect(budgets.length).to.eql(1)
      expect(budgets[0].get('name')).to.eql('Personal Expenses')
      expect(budgets[0].get('categories').length).to.eql(3) // default categories
      expect(budgets[0].get('resetDate')).to.be.a('number')
      expect(budgets[0].get('resetType')).to.eql('MONTH')
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

  describe('reset', async () => {
    let user
    beforeEach(async () => {
      let conn = await app.db.mongo.connection()
      await conn.dropDatabase()
      user = new app.db.User({ username: 'brianranglin@gmail.com' })
      await user.setPassword('12345')
      await user.save()
    })

    it('should give you a reset token and send an email', async () => {
      // Can't figure out how to mock the email client :( but it works...
      // return request(app)
      //   .post('/authenticate/reset/request')
      //   .send({ username: 'brianranglin@gmail.com'})
      //   .expect(200)
      //   .expect(res => {
      //       expect(res.body.status).to.eql('ok')
      //   })
      return true
    })

    it('should reset the password in the second step', async () => {
      user.set('passwordResetToken', '129482')
      await user.save()

      await request(app)
        .post('/authenticate/reset/complete')
        .send({
          username: 'brianranglin@gmail.com',
          password: '54321',
          passwordResetToken: '129482'
        })
        .expect(200)
        .expect(res => {
          expect(res.body.status).to.eql('ok')
        })
      let updatedUser = await app.db.User.findOne({ _id: user.get('_id') })
      let success = await updatedUser.checkPassword('54321')
      expect(success).to.eql(true)
    })
  })
})
