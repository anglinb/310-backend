const jwt = require('jsonwebtoken')
const app = require('../../')
const request = require('supertest');

describe('[misc] authentication', () =>  {

  before(() => {
    app.get('/htis-auth', (req, res, next) => {
      console.log(req.headers)
      return res.json({ message: 'ok', userId: req.user._id })
    })
  })
  describe('passport strategy middleware', () => {
    it('should fail to a 401 w/ no bearer token', async () => {
      // This test is not great b/c express deta
      await request(app)
            .get('/htis-auth')
            .expect(res => {
              console.log('fewljfew')
              console.log(res.body)
            })
            .expect(401)
    })
    it('should return the user id with a valid token', async () => {
      // This test is not great b/c express deta
        var payload = {id: 1};
        var token = jwt.sign(payload, 'development');
         await request(app)
            .get('/htis-auth')
            .set('Authorization',  'Bearer ' + token )
            .expect(200)

    })
  })
})

