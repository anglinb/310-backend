const moment = require('moment')
const app = require('../../../')
const cronFactory = require('../../../src/cron')

const expect = require('chai').expect

describe('cron', () => {
  let CronCls
  beforeEach(async () => {
    let conn = await app.db.mongo.connection()
    await conn.dropDatabase()
    CronCls = cronFactory(app, app.db)
  })

  describe('archival', () => {
    it('should find relevant budgets', async () => {
      let cron = new CronCls({ currentDate: moment('2017-10-05T18:40:47-07:00') })

      let budget1 = new app.db.Budget({
        name: 'Budget 1',
        resetDate: 5,
        resetType: 'MONTH',
        categories: [
          {
            name: 'Food',
            slug: 'food',
            transactions: [
              {
                name: 'Pizza',
                amount: 20,
                description: 'I love pizza',
                recurring: false,
                _id: '327e4520-f5c6-4524-9686-15eafce29a8a',
                timestamp: '2017-10-17T05:00:01.628Z'
              }
            ],
            amount: 30
          }
        ],
        lastArchivalDate: moment('2017-09-05T18:40:47-07:00')
      })
      await budget1.save()

      let budget2 = new app.db.Budget({
        name: 'Budget 2',
        resetDate: 6,
        resetType: 'MONTH',
        categories: [
          {
            'name': 'Food',
            'slug': 'food',
            'transactions': [
              {
                'name': 'Pizza (2)',
                'amount': 20,
                'description': 'I love pizza (2)',
                'recurring': false,
                '_id': '327e4520-f5c6-4524-9686-15eafce29a8a',
                'timestamp': '2017-10-17T05:00:01.628Z'
              }
            ],
            'amount': 40
          }
        ],
        lastArchivalDate: moment('2017-09-05T18:40:47-07:00')
      })
      await budget2.save()

      await cron.archiveBudgets()
      let archives = await app.db.BudgetArchive.find({ budget_id: budget1.get('_id') })
      expect(archives.length).to.eql(1)

      // This is so it's easier to get at the properties
      let archivesAll = archives[0].toJSON()
      expect(archivesAll.categories.length).to.eql(1)

      let updatedBudget1 = await app.db.Budget.findOne({ _id: budget1.get('_id') })
      let updatedBudget1Done = updatedBudget1.toJSON()
      expect(updatedBudget1Done.categories[0].transactions.length).to.eql(0)
      expect(updatedBudget1Done.lastArchivalDate).to.eql(cron.currentDate.toDate())
    })
  })

  describe('sendNotifications', () => {

  })
})
