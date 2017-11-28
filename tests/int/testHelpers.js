const faker = require('faker')
const jwtHelper = require('../../src/helpers/jwt')

module.exports = (app, db) => {
  let exp = {}
  exp.createUser = async (params = {}) => {
    let obj = {}
    let username = faker.internet.email().toLowerCase()
    let user = new db.User(Object.assign({}, { username }, params))
    await user.save()
    obj.user = user

    let payload = { username: user.get('username') }
    obj.auth = [
      'Authorization',
      'Bearer ' + jwtHelper.create(payload)
    ]
    return obj
  }
  return exp
}
