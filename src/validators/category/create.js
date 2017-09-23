const Joi = require('joi')

module.exports = {
  body: {
    name: Joi.string().required(),
    amount: Joi.number().integer().required()
  }
}
