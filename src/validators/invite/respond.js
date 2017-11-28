const Joi = require('joi')

module.exports = {
  body: {
    accept: Joi.boolean().required()
  }
}
