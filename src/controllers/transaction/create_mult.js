const validate = require('express-validation')
const transcationBatchValidation = require('../../validators/transaction/batch')
const uuidv4 = require('uuid/v4')
const VALID_KEYS = ['name', 'amount', 'description', 'recurring', 'recurring_days']

// process.on('unhandledRejection', (reason) => {
//     console.log('Reason: ' + reason);
// });

process.on('unhandledRejection', (reason, promise) => {
    console.warn('Unhandled promise rejection:', promise, 'reason:', reason.stack || reason);
});

module.exports = (router, app, db) => {
  router.post('/', validate(transcationBatchValidation), async(req, res, next) => {
    console.log("Helllllllllllllloooooooioiooooooooooo")
    let transactions = req.body.data
    let successful_transactions = []
    console.log('fljsdljfsldli', req.body)
    for (let i = 0; i < transactions.length; ++i) {
      let transactionObj = transactions[i]
      let curr_budget_id = transactionObj['budget_id']
      let curr_category_slug = transactionObj['category_slug']
      console.log(curr_budget_id)
      let curr_budget = await req.user.getBudgetIfOwner(curr_budget_id)
      console.log(curr_budget)
      let categories = curr_budget.get('categories') || []
      let targetIndex = categories.findIndex((value) => {
        return curr_category_slug === value.get('slug')
      })
      console.log('reached here')
      if (targetIndex !== -1) {
        let curr_category = categories[targetIndex]
        let transactions = curr_category.get('transactions') || []
        let transaction = new db.Transaction(Object.assign({}, ...VALID_KEYS.map((key) => {
          let obj = {}
          obj[key] = transactionObj[key]
          return obj
        }), {
          '_id': uuidv4()
        }, {'timestamp': new Date()}))
        transactions.push(transaction)
        successful_transactions.push(transaction)
        curr_category.set('transactions', transactions)
        categories[targetIndex] = curr_category
        curr_budget.set('categories', categories)
        await curr_budget.save()
      }
    }
    res.json(successful_transactions)
  })
}
