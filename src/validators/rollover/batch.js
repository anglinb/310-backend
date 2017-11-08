const Joi = require('joi')

var rolloverUpdate = Joi.object().keys({
  categorySlug: Joi.string().required(),
  rolloverStatus: Joi.string().required().regex(/^ACTIVE|INACTIVE$/)
})

module.exports = {
  body: {
    data: Joi.array().items(rolloverUpdate)
  }
}
