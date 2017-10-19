const moment = require('moment')
const notifications = require('./notifications')

module.exports = (app, db) => {

  class Cron {
    constructor(props) {
      
      this.currentDate = currentDate
      this.archiveBudgets = this.archiveBudgets.bind(this)
    }

    async run() {
      await this.archiveBudgets()
      return this.sendNotifications()
    }

    async sendNotifications() {
      let notifications = notifications.Notifications({ currentDate: this.currentDate })
      return notifications.sendNotifications()
    }

    async archiveBudgets () {
      // TODO: Deal with month
       console.log('FUCK E', this.currentDate)
      let resetDate = this.currentDate.date()
      let budgets = await db.Budget.find({ resetDate: resetDate, resetType: 'MONTH' })
      for (var j = 0; j < budgets.length; j++) {
        let budget = budgets[j]
        let threshold = this.currentDate.clone()
        threshold.subtract(4, 'days')

        let lastArchivalDate = moment.utc(budget.get('lastArchivalDate'))

        if (!threshold.isBefore(lastArchivalDate)) {
          // If we haven't achieved in the last 5 days and today is the reset date, we should move to archieve
          let budgetArchive = new db.BudgetArchive(
            {
              budget_id: budget.get('_id'),
              name: budget.get('name'),
              categories: budget.get('categories'),
              resetDate: budget.get('resetDate'),
              resetType: budget.get('resetType')
            }
          )
          await budgetArchive.save()

          let categories = []
          let gottenCategories = budget.get('categories')
          for (var i = 0; i < gottenCategories.length; i++) {
            let category = gottenCategories[i]
            let categoryObj = {
              name: category.get('name'),
              slug: category.get('slug'),
              amount: category.get('amount'),
              transactions: []
            }
            categories.push(categoryObj)
          }
          budget.set('categories', categories)
          budget.set('lastArchivalDate', this.currentDate.toDate())
          await budget.save()
        }
      }
    }
  }
  return Cron
}
