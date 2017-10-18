
let lastNotificationDateMutator = {
  DAILY: (currentDate) => {
    let newDate = currentDate.clone()
    newDate.subtract(1, 'days')
    return newDate
  },
  WEEKLY: (currentDate) => {
    let newDate = currentDate.clone()
    newDate.subtract(1, 'week')
    return newDate
  },
  MONTHLY: (currentDate) => {
    let newDae = currentDate.clone()
    newDate.subtract(1, 'month')
    return newDate
  },
  NEVER: (currentDate) => {
    // Never will never be in the past :P 
    let newDae = currentDate.clone()
    newDate.add(1, 'month')
    return newDate
  }
}

module.exports = (app, db) => {

  class UserNotifications {
    constructor({ notifications, user }) {
      this.notifications = notifications
      this.user = user
    }

    async sendNotification() {
      let notifications = await this.calculateNotifications)()
      let message = ''
      notifications.forEach((notification) => {
        message += `You are over the ${notification.category.metThreshold}% threshold in the ${notification.category.name} category for budget ${notification.budget.name}. There is $${notification.category.amount - notification.category.spent} left in the budget and you have ${daysLeft} days left in this budget period.\n\n` 
      })
      // Send 
      console.log(message)
    }

    async calculateNotifications()  {
      let notificationSettings = user.get('notifications')
      let lastNotification = user.get('lastNotificationDate') || moment.unix(0).toDate()

      // Take the last notification setting and subtract the appropriate amount
      let lastNotificationThreshold = lastNotificationDateMutator[notificationSettings.frequency](lastNotification)
      if (!lastNotificationThreshold.isBefore(this.currentDate) || notificationSettings.frequency === 'NEVER')  {
        return 
      }

      this.thresholds = notificationSettings.thresholds.sort((a, b) => {
        a < b
      })

      // Loop through all the budgets 
      let budgets = await user.budgets()
      let toSendNotifications budgets.map((budget) => {
        let results = this.calculateForBudget(budget)
        return results.map((category) => {
          return { category,  budget }
        })
      })
      return toSendNotifications
    }

    calculateForBudget(budget) {
      let dateHelper = DateHelper({
        currentDate: this.currentDate,
        resetDate: budget.get('resetDate'),
        resetType: budget.get('resetType'),
      })
      let triggeredCategories = budget.categories.map((category) => {
        let ret = this.calculateForCategory(category, dateHelper)
        if (ret) {
          return ret
        }
        return false
      }).filter((values) => {
        if (value) {
          return true
        } else {
          return false
        }
      })
    }

    calculateForCategory(category, dateHelper) {
      // How much have you spent
      let spent = category.transactions.reduce((transaction) => {
        transaction.amount
      }, 0)
      let percentage = (spent / category.amount) * 100 

      // What's the highest percentage threshold
      let metThreshold = this.calculateThresholdHits(category, dateHelper, percentage) 
      if (!metThreshold) {
        return null
      }

      // Return back the data needed for a notification
      let daysLeft = dateHelper.nextResetDate().diff(this.currentDate, 'days')
      return {
        metThreshold,
        category,
        spent, 
        daysLeft
      }
    }

    calculateThresholdHits(category, dateHelper, percentage) {
      for(let i = 0; i < this.thresholds.length; i++) {
        let threshold = this.thresholds[i]
        if (threshold < percentage) {
          return threshold
        }
      }
      return null
    }
  }

  class Notifications {
    constructor({ currentDate: moment(), }) {
      this.currentDate = currentDate      
    }

    async run() {
      let users = await db.find({})
        users.forEach((user) => {
          new UserNotifications({ notifications: this, user })
        })
      })
    }
  }
  return { Noifications, UserNotifications }
}