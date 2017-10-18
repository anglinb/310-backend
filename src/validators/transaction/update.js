
const Joi = require('joi')
module.exports = {
  body: {
    name: Joi.string(),
    amount: Joi.number(),
    description: Joi.string(),
    recurring: Joi.boolean(),
    recurring_days: Joi.number()
  }
}
