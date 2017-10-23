const Joi = require('joi')

module.exports = {
  body: {
    thresholds: Joi.array().items(Joi.number().valid(50, 60, 70, 80, 90, 100)).required(),
    frequency: Joi.string().valid('DAILY', 'WEEKLY', 'MONTHLY', 'NEVER').required()
  }
}
