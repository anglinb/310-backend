const Joi = require('joi')

var transaction = Joi.object().keys({
  name: Joi.string().required(),
  amount: Joi.number().required(),
  description: Joi.string().required(),
  recurring: Joi.boolean().required(),
  budget_id: Joi.string().required(),
  recurring_days: Joi.number().integer()
})

module.exports = {
  body: {
    data: Joi.array().items(transaction)
  }
}
