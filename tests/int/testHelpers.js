const jwtHelper = require('../../src/helpers/jwt')

module.exports = (app, db) => {
  let exp = {}
  exp.createUser = async (params = {}) => {
    let obj = {}
    let user = new db.User(params)
    await user.save()
    obj.user = user

    let payload = { _id: user.get('_id') }
    obj.auth = [
      'Authorization',
      'Bearer ' + jwtHelper.create(payload)
    ]
    return obj
  }
  return exp
}
