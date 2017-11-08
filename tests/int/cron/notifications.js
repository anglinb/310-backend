const moment = require('moment')
const app = require('../../../')
const notifications = require('../../../src/cron/notifications')

const expect = require('chai').expect
const correcString = [
  `You are over the 50% threshold in the Food category for budget New Budget. There is $40 left in the budget and you have 5 days left in this budget period.`,
  `You are over the 50% threshold in the Entertainment category for budget New Budget. There is $30 left in the budget and you have 5 days left in this budget period.`
].join('\n\n')

describe('notifications', () => {
  describe('integration', () => {
    let NotificationCls
    let UserNotificationCls
    let newUser
    let dbBudget
    beforeEach(async () => {
      process.env.DISABLE_
      let conn = await app.db.mongo.connection()
      await conn.dropDatabase()

      let clses = notifications(app, app.db)
      NotificationCls = clses.Notifications
      UserNotificationCls = clses.UserNotifications

      newUser = new app.db.User({
        username: 'banglin@usc.edu',
        notifications: {
          frequency: 'DAILY',
          thresholds: [50, 80]
        }
      })
      await newUser.save()

      let budget = {
        owner_id: newUser.get('_id'),
        name: 'New Budget',
        categories: [
          {
            amount: 100,
            name: 'Food',
            slug: 'food',
            transactions: [
              {
                amount: 50,
                name: 'Nice Dinner'
              },
              {
                amount: 10,
                name: 'Fast Food'
              }
            ]
          },
          {
            amount: 70,
            name: 'Entertainment',
            slug: 'entertainment',
            transactions: [
              {
                amount: 40,
                name: 'movies'
              }
            ]
          }
        ],
        resetDate: 20,
        resetType: 'MONTH'
      }
      dbBudget = new app.db.Budget(budget)
      await dbBudget.save()
    })
    it('should send the correct notification & update the last notified date', async () => {
      let notif = new UserNotificationCls({ notifications: { currentDate: moment('2017-09-15') }, user: newUser })
      let { message } = await notif.sendNotification()
      expect(message).to.eql(correcString)
    })

    it('notifications should run through all emails', async () => {
      let notif = new NotificationCls({ currentDate: moment('2017-09-15') })
      await notif.run()
      // expect(message).to.eql(correcString)
    })
  })
  /*
  describe('unit', () => {

    let NotificationCls
    let UserNotificationCls
    beforeEach(() => {

      let clses = notifications(app, app.db)
      NotificationCls = clses.NotificationCls
      UserNotificationCls = clses.UserNotifications
    })
    describe('calculateThresholdHits', () => {
      it('should find the highest threshold when multiple apply', () => {
        let userNotif = new UserNotificationCls({})
        userNotif.thresholds = [80, 60, 40]
        let threshold = userNotif.calculateThresholdHits(90)
        expect(threshold).to.eql(80)
      })

      it('should return null when threshold not met', () => {
        let userNotif = new UserNotificationCls({})
        userNotif.thresholds = [80, 60, 40]
        let threshold = userNotif.calculateThresholdHits(30)
        expect(threshold).to.be.a('null')
      })
    })
    describe('thresholds', () => {
      it('should put them in order', () => {
        let notificationSettings = {
          thresholds: [10, 100, 60]
        }
        let user = {
          get(key) {
            return {
              notifications: notificationSettings
            }[key]
          }
        }
        let userNotif = new UserNotificationCls({ user })
        let sortedThresholds = userNotif.calculateThresholds()
        expect(sortedThresholds).to.eql([100, 60, 10])
      })
    })
    describe('calculateForCategory', () => {
      let currentDate
      beforeEach(() => {
        currentDate = moment('2017-09-15')
      })
      it('should calculate for the category', () => {
        let userNotif = new UserNotificationCls({ notifications: { currentDate }})
        userNotif.thresholds = [80, 60, 40]
        let category = {
          amount: 100,
          transactions: [
            {
              amount: 50,
            },
            {
              amount: 25,
            }
          ]
        }
        let dateHelper = new DateHelper({ currentDate, resetDate: 20, resetType: 'MONTH' })
        let catNotif = userNotif.calculateForCategory(category, dateHelper)
        expect(catNotif).to.eql({
          metThreshold: 60,
          category,
          spent: 75,
          daysLeft: 5,
        })
      })
      it('should return null when the threshold is not met', () => {
        let userNotif = new UserNotificationCls({})
        userNotif.thresholds = [80, 60, 40]
        let category = {
          amount: 100,
          transactions: [
          ]
        }

        // No transactions, haven't hit the threshold
        let dateHelper = new DateHelper({ currentDate, resetDate: 20, resetType: 'MONTH' })
        let catNotif = userNotif.calculateForCategory(category, dateHelper)
        expect(catNotif).to.be.a('null')
      })
    })
    describe('calculateForBudget', () => {
      let currentDate
      beforeEach(() => {
        currentDate = moment('2017-09-15')
      })
      it('should calculate for the category', () => {
        let userNotif = new UserNotificationCls({ notifications: { currentDate }})
        userNotif.thresholds = [80, 60, 40]
        // This one should be included
        let category1 = {
          amount: 100,
          transactions: [
            {
              amount: 50,
            },
            {
              amount: 25,
            }
          ]
        }

        // This  one should not be included
        let category2 = {
          amount: 100,
          transactions: [
          ]
        }
        let budget = {
          'resetDate': 20,
          'resetType': 'MONTH',
          name: 'budget1',
          categories: [
            category1,
            category2
          ]
        }
        let results = userNotif.calculateForBudget(budget)
        expect(results.length).to.eql(1)
        expect(results[0]).to.eql({
          metThreshold: 60,
          category: category1,
          spent: 75,
          daysLeft: 5
        })
      })
    })

    describe('calculateNotifications', () => {
      let currentDate
      beforeEach(() => {
        currentDate = moment('2017-09-15')
      })
      it('should calculate for the category', async () => {
        // This one should be included
        let category1 = {
          amount: 100,
          transactions: [
            {
              amount: 50,
            },
            {
              amount: 25,
            }
          ]
        }

        // This  one should not be included
        let category2 = {
          amount: 100,
          transactions: [
          ]
        }
        let budget1 = {
          'resetDate': 20,
          'resetType': 'MONTH',
          name: 'budget1',
          categories: [
            category1,
            category2
          ]
        }
        let budget2 = {
          'resetDate': 20,
          'resetType': 'MONTH',
          categories: [],
        }

        let user = {
          get(key) {
            return {
              notifications: {
                thresholds: [80, 60, 40],
                frequency: 'DAILY',
              },
              lastNotificationDate: moment('2017-09-10'),
            }[key]
          },
          async budgets() {
            return [
                budget1,
                budget2
            ]
          }
        }
        let userNotif = new UserNotificationCls({ notifications: { currentDate }, user })

        let results = await userNotif.calculateNotifications()
        expect(results.length).to.eql(1)
        expect(results[0]).to.eql({
          budget: budget1,
          category:  {

            metThreshold: 60,
            category: category1,
            spent: 75,
            daysLeft: 5
          }
        })
      })
    })
   describe('sendNotification', () => {
      let currentDate
      beforeEach(() => {
        currentDate = moment('2017-09-15')
      })
      it('should build the correct notifications', async () => {
        // This one should be included
        let category1 = {
          name: 'food',
          amount: 100,
          transactions: [
            {
              amount: 50,
            },
            {
              amount: 25,
            }
          ]
        }

        // This  one should not be included
        let category2 = {
          amount: 100,
          transactions: [
          ]
        }
        let budget1 = {
          'resetDate': 20,
          'resetType': 'MONTH',
          name: 'budget1',
          categories: [
            category1,
            category2
          ]
        }
        let budget2 = {
          'resetDate': 20,
          'resetType': 'MONTH',
          categories: [],
        }

        let user = {
          get(key) {
            return {
              notifications: {
                thresholds: [80, 60, 40],
                frequency: 'DAILY',
              },
              lastNotificationDate: moment('2017-09-10'),
            }[key]
          },
          async budgets() {
            return [
                budget1,
                budget2
            ]
          }
        }
        let userNotif = new UserNotificationCls({ notifications: { currentDate }, user })

        let results = await userNotif.sendNotification(true)
        expect(results).to.eql(`You are over the 60% threshold in the food category for budget budget1. There is $25 left in the budget and you have 5 days left in this budget period.\n\n`)
        // expect(results.length).to.eql(1)
        // expect(results[0]).to.eql({
        //   budget: budget1,
        //   category:  {

        //     metThreshold: 60,
        //     category: category1,
        //     spent: 75,
        //     daysLeft: 5
        //   }
        // })
      })
    })

  })
*/
})
process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason)
  // application specific logging, throwing an error, or other logic here
})
