const validate = require('express-validation')
const rolloverBatchValidation = require('../../validators/rollover/batch')

module.exports = (router, app, db) => {
  router.post('/_batch',
    validate(rolloverBatchValidation),
    async (req, res, next) => {
      let rollovers = {}

      req.body.data.forEach((rolloverUpdate) => {
        rollovers[rolloverUpdate.categorySlug] = rolloverUpdate.rolloverStatus
      })

      // Linear search through all categories
      let categories = req.budget.get('categories')
      for (let i = 0; i < categories.length; i++) {
        let category = categories[i]

        // If we have a request to update this category
        if (rollovers[category.get('slug')] !== undefined) {
          if (rollovers[category.get('slug')] === 'ACTIVE') {
            category.set('rolloverStatus', 'ACTIVE')
          } else {
            category.set('rolloverStatus', 'INACTIVE')
          }
          categories[i] = category
        }
      }

      req.budget.set('categories', categories)
      await req.budget.save()
      return res.json(req.budget.toJSON())
    })
}
