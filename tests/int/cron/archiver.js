const moment = require('moment')
const app = require('../../../')
const archiverFactory = require('../../../src/cron/archiver')

const expect = require('chai').expect

describe('archiver', () => {

  let archiver
  beforeEach(async () => {
    process.env.LOG_LEVEL="fatal"
    let conn = await app.db.mongo.connection()
    await conn.dropDatabase()
    archiver = archiverFactory(app, app.db)
  })

  describe('BudgetArchival', () => {

    let budgetArchival
    let budget
    beforeEach(async () =>{
      budgetArchival = archiver.BudgetArchival
      budget = new app.db.Budget({
        name: 'New Budget',
        categories: [
          {
            name: 'Food',
            slug: 'food',
            amount: 100,
            transactions: [
              {
                name: 'dinner',
                description: 'was dope',
                amount: 20,
                recurring: false,
              },
              {
                name: 'Subscription',
                description: 'some foods',
                amount: 30,
                recurring: true
              }
            ]
          }
        ],
        resetDate: 2,
        resetType: 'MONTH',
        lastArchivalDate: moment('2017-01-02').toDate(),
      })
      await budget.save()
    })

    it('should return correctly for shouldArchive', () => {
      // Should archive
      let currentDate = moment('2017-02-02')
      let archival = new budgetArchival({ currentDate, budget })
      expect(archival.shouldArchive()).to.eql(true)

      // Correct day, already run
      currentDate = moment('2017-01-02')
      archival = new budgetArchival({ currentDate, budget })
      expect(archival.shouldArchive()).to.eql(false)

      // Less than 4 days for some reason      
      currentDate = moment('2017-01-03')
      archival = new budgetArchival({ currentDate, budget })
      expect(archival.shouldArchive()).to.eql(false)
    })

    it('should create a new archive', async () => {
      let currentDate = moment('2017-02-02')
      let archival = new budgetArchival({ currentDate, budget })
      await archival.createArchive()
      let archives = await app.db.BudgetArchive.find({ budget_id: budget.get('_id') })
      expect(archives.length).to.eql(1)
      expect(archives[0].get('name')).to.eql('New Budget')
      expect(archives[0].get('resetDate')).to.eql(2)
    })

    it('should successfully clear budget, leaving recurring transactions', async ()=> {
      let currentDate = moment('2017-02-02')
      let archival = new budgetArchival({ currentDate, budget })
      await archival.clearBudget()
      let dbBudget = await app.db.Budget.findOne({ _id: budget.get('_id') })
      let transactions = dbBudget.get('categories')[0].get('transactions')
      expect(transactions.length).to.eql(1)
      expect(transactions[0].get('amount')).to.eql(30)
      expect(transactions[0].get('name')).to.eql('Subscription')
    })

    describe.only('rollover', () => {

      it('should successfully clear budget and setup rollover', async ()=> {
        let currentDate = moment('2017-02-02')
        let archival = new budgetArchival({ currentDate, budget })
        await archival.clearBudget()
        let dbBudget = await app.db.Budget.findOne({ _id: budget.get('_id') })
        let categories = dbBudget.get('categories')
        expect(categories[0].get('rollover')).to.eql(50)
        expect(categories[0].get('rolloverStatus')).to.eql('UNKNOWN')
      })

      it('should successfully clear budget and not provide rollover', async ()=> {
        // Setup the budget to be over the amount
        let transactions = budget.get('categories')[0].get('transactions')
        transactions.push({
          name: 'a lot of foodz',
          description: 'wfdlksjdas dope',
          amount: 100,
          recurring: false,
        })
        let categories = budget.get('categories')
        categories[0].set('transactions', transactions)
        budget.set('categories', categories)
        await budget.save()

        let currentDate = moment('2017-02-02')
        let archival = new budgetArchival({ currentDate, budget })
        await archival.clearBudget()
        let dbBudget = await app.db.Budget.findOne({ _id: budget.get('_id') })
        let dbCategories = dbBudget.get('categories')
        expect(dbCategories[0].get('rollover')).to.eql(0)
        expect(dbCategories[0].get('rolloverStatus')).to.eql('INACTIVE')
      })
    })

    it('should correctly archive the budget', async () => {
      let currentDate = moment('2017-02-02')
      let archival = new budgetArchival({ currentDate, budget })
      await archival.archieveBudget()
      let dbBudget = await app.db.Budget.findOne({ _id: budget.get('_id') })
      let transactions = dbBudget.get('categories')[0].get('transactions')
      expect(transactions.length).to.eql(1)
      expect(transactions[0].get('amount')).to.eql(30)
      expect(transactions[0].get('name')).to.eql('Subscription')
      expect(dbBudget.get('lastArchivalDate')).to.eql(currentDate.toDate())
      let archives = await app.db.BudgetArchive.find({ budget_id: budget.get('_id') })
      expect(archives.length).to.eql(1)
      expect(archives[0].get('name')).to.eql('New Budget')
      expect(archives[0].get('resetDate')).to.eql(2)

    })
  })

  describe('archiver (query)', () => {
    it('should return the correct montly budgets', async () => {
      let inputBudgets = [
        {
          resetDate: 3,
          resetType: 'MONTH',
        },
        {
          resetDate: 2,
          resetType: 'MONTH',
        },
        {
          resetDate: 2,
          resetType: 'MONTH',
        },
        {
          resetDate: 3,
          resetType: 'WEEK',
        },
        {
          resetDate: 2,
          resetType: 'WEEK',
        },
        {
          resetDate: 2,
          resetType: 'WEEK',
        },
      ]
      await Promise.all(inputBudgets.map(async (budget) =>{
        return new app.db.Budget(budget).save()
      }))

      let count = await app.db.Budget.find({})

      // Monthly
      let currentDate = moment('2017-01-02')
      let archiverFirst = new archiver.Archiver({ currentDate })
      let foundBudgets = await archiverFirst.getMonthlyBudgets()
      expect(foundBudgets.length).to.eql(2)
      expect(foundBudgets[0].get('resetDate')).to.eql(2)
      expect(foundBudgets[1].get('resetDate')).to.eql(2)


      currentDate = moment('2017-01-03')
      archiverFirst = new archiver.Archiver({ currentDate })
      foundBudgets = await archiverFirst.getMonthlyBudgets()
      expect(foundBudgets.length).to.eql(1)
      expect(foundBudgets[0].get('resetDate')).to.eql(3)

      currentDate = moment('2017-01-04')
      archiverFirst = new archiver.Archiver({ currentDate })
      foundBudgets = await archiverFirst.getMonthlyBudgets()
      expect(foundBudgets.length).to.eql(0)

      // Weekly
      currentDate = moment('2017-01-03') // This is a Tuesday
      archiverFirst = new archiver.Archiver({ currentDate })
      foundBudgets = await archiverFirst.getWeeklyBudgets()
      expect(foundBudgets.length).to.eql(2)
      expect(foundBudgets[0].get('resetDate')).to.eql(2)
      expect(foundBudgets[1].get('resetDate')).to.eql(2)

      currentDate = moment('2017-01-04') // This is a Wednesday
      archiverFirst = new archiver.Archiver({ currentDate })
      foundBudgets = await archiverFirst.getWeeklyBudgets()
      expect(foundBudgets.length).to.eql(1)
      expect(foundBudgets[0].get('resetDate')).to.eql(3)

      currentDate = moment('2017-01-05') // This is a Thursday
      archiverFirst = new archiver.Archiver({ currentDate })
      foundBudgets = await archiverFirst.getWeeklyBudgets()
      expect(foundBudgets.length).to.eql(0)
    })
  })
})
