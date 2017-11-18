
const Joi = require('joi')

module.exports = {
  body: {
    name: Joi.string().required(),
    resetType: Joi.string().required().allow(['WEEK', 'MONTH']),
    resetDate: Joi.number().integer().required().min(0).max(31),
  }
}
