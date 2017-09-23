const jwt = require('jsonwebtoken')
module.exports.create = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET)
}
