const moment = require('moment')
const DateHelper = require('../helpers/date')
const EmailSender = require('../helpers/email')

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
    let newDate = currentDate.clone()
    newDate.subtract(1, 'month')
    return newDate
  },
  NEVER: (currentDate) => {
    // Never will never be in the past :P
    let newDate = currentDate.clone()
    newDate.add(1, 'month')
    return newDate
  }
}

module.exports = (app, db) => {
  class UserNotifications {
    constructor ({ notifications = '', user = '' }) {
      this.notifications = notifications
      this.user = user
    }

    async sendNotification (dryRun = false) {
      let notifications = await this.calculateNotifications()

      let messages = notifications.map((notification) => {
        return `You are over the ${notification.category.metThreshold}% threshold in the ${notification.category.category.get('name')} category for budget ${notification.budget.get('name')}. There is $${notification.category.category.get('amount') - notification.category.spent} left in the budget and you have ${notification.category.daysLeft} days left in this budget period.`
      })
      let message = messages.join('\n\n')
      let htmlMessage = messages.join('<br /><br />')
      // Allow a dry run to not actually send the email
      if (dryRun) {
        return { message, htmlMessage }
      }

      try {
        await new EmailSender({
          toEmail: this.user.get('username'),
          emailText: message,
          emailHTML: htmlMessage,
          emailSubject: `Sanity Budget Update | ${this.notifications.currentDate.format('M/D')}`
        }).send()
      } catch (e) {
        console.log('WHOOPS! Email sending error', e)
      }
      return { message, htmlMessage }
    }

    async calculateNotifications () {
      if (!this.needsNotification()) {
        return
      }

      this.thresholds = this.calculateThresholds()

      // Loop through all the budgets
      let budgets = await this.user.budgets()
      let toSendNotifications = budgets.map((budget) => {
        let results = this.calculateForBudget(budget)
        return results.map((category) => {
          return { category, budget }
        })
      }).reduce((prev, arr) => {
        return prev.concat(arr)
      }, [])
      return toSendNotifications
    }

    async needsNotification () {
      let notificationSettings = this.user.get('notifications')
      let lastNotification = this.user.get('lastNotificationDate') ? moment(this.user.get('lastNotificationDate')) : moment.unix(0)

      // Take the last notification setting and subtract the appropriate amount
      let lastNotificationThreshold = lastNotificationDateMutator[notificationSettings.frequency](lastNotification)
      if (lastNotificationThreshold.isBefore(this.notifications.currentDate) && notificationSettings.frequency !== 'NEVER') {
        return true
      }
      return false
    }

    calculateForBudget (budget) {
      let dateHelper = new DateHelper({
        currentDate: this.notifications.currentDate,
        resetDate: budget.get('resetDate'),
        resetType: budget.get('resetType')
      })
      return budget.get('categories').map((category) => {
        let ret = this.calculateForCategory(category, dateHelper)
        if (ret) {
          return ret
        }
        return false
      }).filter((value) => {
        if (value) {
          return true
        } else {
          return false
        }
      })
    }

    calculateForCategory (category, dateHelper) {
      // How much have you spent
      let spent = category.get('transactions').reduce((runningSum, transaction) => {
        return runningSum + transaction.get('amount')
      }, 0)
      let percentage = (spent / category.get('amount')) * 100

      // What's the highest percentage threshold
      let metThreshold = this.calculateThresholdHits(percentage)
      if (!metThreshold) {
        return null
      }

      // Return back the data needed for a notification
      let nextResetDate = dateHelper.nextResetDate()
      let daysLeft = nextResetDate.diff(this.notifications.currentDate, 'days')
      return {
        metThreshold,
        category,
        spent,
        daysLeft
      }
    }

    calculateThresholdHits (percentage) {
      for (let i = 0; i < this.thresholds.length; i++) {
        let threshold = this.thresholds[i]
        if (threshold < percentage) {
          return threshold
        }
      }
      return null
    }

    calculateThresholds () {
      let cpy = this.user.get('notifications').thresholds
      return cpy.sort((a, b) => {
        return a < b
      })
    }
  }

  class Notifications {
    constructor ({ currentDate = moment() }) {
      this.currentDate = currentDate
    }

    async run () {
      let users = await db.User.find({})
      users.forEach(async (user) => {
        return new UserNotifications({ notifications: this, user }).sendNotification()
      })
    }
  }
  return { Notifications, UserNotifications }
}
