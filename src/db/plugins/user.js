const mongodb = require('mongodb')
const categoryDefaults = require('../../helpers/defaults')

module.exports = (db) => {
  db.User.use((Model) => {
    Model.prototype.budgets = async function () {
      return db.Budget.find({ owner_ids: this.get('_id') })
    }

    Model.prototype.createDefaultBudget = async function () {
      let budget = new db.Budget(Object.assign({},
        {
          owner_ids: [this.get('_id')],
          group: false,
          name: 'Personal Expenses',
          resetDate: new Date().getDate() + 1,
          resetType: 'MONTH'
        },
        categoryDefaults
      ))
      return budget.save()
    }

    Model.prototype.getBudgetIfOwner = async function (budgetId) {
      if (typeof budgetId === 'string') {
        budgetId = mongodb.ObjectID(budgetId)
      }
      console.log("reached here")
      console.log(this.get("_id"))
      return db.Budget.findOne({_id: budgetId, owner_ids: this.get("_id") })
    }
  })
}
