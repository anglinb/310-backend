const request = require('supertest')
const app = require('../../../../')
const testHelpers = require('../../testHelpers')
const expect = require('chai').expect

describe('[controller] budget', () => {
  describe('with authentication', () => {
    beforeEach(async () => {
      let collection = await app.db.Budget.getCollection()
      return collection.remove({})
    })
    describe('create', () => {
      it('should create the budget', async () => {
        let budgetReq = {
          name: 'Budget 1',
          resetDate: 5,
          resetType: 'MONTH'
        }
        let user = await testHelpers(app, app.db).createUser()
        console.log("I am here")
        response = await request(app)
          .post('/budgets')
          .set(...user.auth)
          .send(budgetReq)
          console.log("****************************************")
          console.log(response)
          //.delay(500)
          //.expect(200)
          //.expect(res => {

            //console.log(res.body.owner_ids)
            //expect(res.body.owner_ids[-1]).to.eql(user.user.get('_id').toString())
            //expect(res.body.name).to.eql('Budget 1')
          //})
          // this.setTimeout(async() => {
          //   let budget = await app.db.Budget.findOne({
          //     name: 'Budget 1',
          //     owner_ids: [user.user.get('_id')]
          //   })
          //   expect(budget).to.not.be.a('null')
          // }, 1000);

      })
      it('should reject invalid budgets', async () => {
        let budgetReq = { }
        let user = await testHelpers(app, app.db).createUser()
        await request(app)
          .post('/budgets')
          .set(...user.auth)
          .send(budgetReq)
          .expect(400)
      })
    })
  })
})
