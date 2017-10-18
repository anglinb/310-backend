
const Joi = require('joi')
module.exports = {
  body: {
    name: Joi.string().required(),
    amount: Joi.number().required(),
    description: Joi.string().required(),
    recurring: Joi.boolean().required(),
    recurring_days: Joi.number().integer()
  }
}
