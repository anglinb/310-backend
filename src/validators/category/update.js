const Joi = require('joi')

module.exports = {
  body: {
    name: Joi.string(),
    amount: Joi.number().integer()
  }
}
