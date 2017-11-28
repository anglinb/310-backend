const Joi = require('joi')

module.exports = {
  body: {
    username: Joi.string().required()
  }
}
