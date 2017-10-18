const mongodb = require('mongodb')

module.exports = (db) => {
  db.User.use((Model) => {
    Model.prototype.budgets = async function () {
      return db.Budget.find({ owner_id: this.get('_id') })
    }

    Model.prototype.createDefaultBudget = async function () {
      let budget = new db.Budget({
        owner_id: this.get('_id'),
        name: 'Personal Expenses',
        categories: [],
        resetDate: new Date().getDate() + 1,
        resetType: 'MONTH'
      })
      return budget.save()
    }

    Model.prototype.getBudgetIfOwner = async function (budgetId) {
      if (typeof budgetId === 'string') {
        budgetId = mongodb.ObjectID(budgetId)
      }
      return db.Budget.findOne({ owner_id: this.get('_id'), _id: budgetId })
    }
  })
}
