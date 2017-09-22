const request = require('supertest');
const expect = require('chai').expect
const app = require('../../../../')

describe('[controller] home', () => {
  it('should respond with a msg to check docs', async () => {
    await request(app)
      .get('/')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(res => {
        expect(res.body.message).to.include('please check the docs')
      })
  })
})

