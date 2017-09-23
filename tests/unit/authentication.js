const authMiddleware = require('../../src/middlewares/auth')
const jwtHelper = require('../../src/helpers/jwt')
const jwt = require('jsonwebtoken')
const app = require('../../')

const sinon = require('sinon')
const expect = require('chai').expect

describe('[misc] authentication', () =>  {

  describe.only('middleware', () => {
    it('should return 401 on no token', async () => {
      let middleware = authMiddleware(app, app.db)
      let req = { headers: {}}
      let res = { sendStatus: sinon.spy()}
      let next = sinon.spy()
      middleware(req, res, next)
      expect(next.callCount).to.eql(0) // Next shouldn't get called
      expect(res.sendStatus.callCount).to.eql(1)
      expect(res.sendStatus.calledWith(401)).to.eql(true)
    })

    it('should return 401 on an invalid token', async () => {
      let middleware = authMiddleware(app, app.db)
      let req = { headers: { authorization: 'Bearer 1234' }}
      let res = { sendStatus: sinon.spy()}
      let next = sinon.spy()
      middleware(req, res, next)
      expect(next.callCount).to.eql(0) // Next shouldn't get called
      expect(res.sendStatus.callCount).to.eql(1)
      expect(res.sendStatus.calledWith(401)).to.eql(true)
    })

    it('should 401 if the user is not found', async () => {
      let db = { User: {  findOne: sinon.stub().returns(null) }}
      let middleware = authMiddleware(app, db)
      let token = jwtHelper.create({ _id: '1234'})
      let req = { headers: { authorization: 'Bearer ' + token }}
      let res = { sendStatus: sinon.spy() }
      let next = sinon.spy()
      await middleware(req, res, next)
      expect(next.callCount).to.eql(0) // Next should get called
      expect(res.sendStatus.callCount).to.eql(1)
      expect(res.sendStatus.calledWith(401)).to.eql(true)
      expect(db.User.findOne.callCount).to.eql(1)
      expect(db.User.findOne.calledWith({ _id: '1234'})).to.eql(true)
    })

    it('should set the user if found', async () => {
      let user = {get: () => { return 'banglin@usc.edu' }}
      let db = { User: {  findOne: sinon.stub().returns(user) }}
      let middleware = authMiddleware(app, db)
      let token = jwtHelper.create({ _id: '1234'})
      let req = { headers: { authorization: 'Bearer ' + token }}
      let res = { sendStatus: sinon.spy() }
      let next = sinon.spy()
      await middleware(req, res, next)
      expect(next.callCount).to.eql(1) // Next should get called
      expect(res.sendStatus.callCount).to.eql(0)
      expect(db.User.findOne.callCount).to.eql(1)
      expect(db.User.findOne.calledWith({ _id: '1234'})).to.eql(true)
      expect(req.user).to.eql(user)
    })
  })
})

