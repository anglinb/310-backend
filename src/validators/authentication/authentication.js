const Joi = require('joi')

module.exports = {
  body: {
    username: Joi.string().email().required(),
    password: Joi.string().regex(/[a-zA-Z0-9]{3,30}/).required()
  }
}
