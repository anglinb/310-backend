const moment = require('moment')

module.exports = (app, db) => {
  class BudgetArchival {
    constructor ({ budget = null, currentDate = moment() }) {
      this.budget = budget
      this.currentDate = currentDate
    }

    shouldArchive () {
      let threshold = this.currentDate.clone()
      threshold.subtract(4, 'days')
      let lastArchivalDate = moment.utc(this.budget.get('lastArchivalDate'))
      let shouldArchive = !threshold.isBefore(lastArchivalDate)
      return shouldArchive
    }

    async createArchive () {
      let budgetArchive = new db.BudgetArchive({
        budget_id: this.budget.get('_id'),
        name: this.budget.get('name'),
        categories: this.budget.get('categories'),
        resetDate: this.budget.get('resetDate'),
        resetType: this.budget.get('resetType')
      })
      return budgetArchive.save()
    }

    async clearBudget () {
      let categories = this.budget.get('categories').map((category) => {
        let amountUsed = category.get('transactions').reduce((runningTotal, transaction) => {
          return runningTotal + transaction.get('amount')
        }, 0)
        let rollover = 0
        if (amountUsed < category.get('amount')) {
          rollover = category.get('amount') - amountUsed
        }
        return {
          name: category.get('name'),
          slug: category.get('slug'),
          rollover: rollover,
          rolloverStatus: rollover === 0 ? 'INACTIVE' : 'UNKNOWN',
          amount: category.get('amount'),
          transactions: category.get('transactions').filter((transaction) => {
            return transaction.get('recurring') === true
          })
        }
      })
      this.budget.set('categories', categories)
      this.budget.set('lastArchivalDate', this.currentDate.toDate())
      return this.budget.save()
    }

    async archieveBudget () {
      if (!this.shouldArchive()) { return false }
      await this.createArchive()
      await this.clearBudget()
    }
  }

  class Archiver {
    constructor ({ currentDate = moment() }) {
      this.currentDate = currentDate
    }

    async getMonthlyBudgets () {
      let resetDate = this.currentDate.date()
      return db.Budget.find({ resetDate, resetType: 'MONTH' })
    }

    async getWeeklyBudgets () {
      let resetDate = this.currentDate.day()
      return db.Budget.find({ resetDate, resetType: 'WEEK' })
    }

    async run () {
      this.getMonthlyBudgets().forEach(async (budget) => {
        return new BudgetArchival({ budget, currentDate: this.currentDate }).archiveBudget()
      })
      this.getWeeklyBudgets().forEach(async (budget) => {
        return new BudgetArchival({ budget, currentDate: this.currentDate }).archiveBudget()
      })
    }
  }
  return { Archiver, BudgetArchival }
}
