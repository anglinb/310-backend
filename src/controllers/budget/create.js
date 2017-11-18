const moment = require('moment')
const validate = require('express-validation')
const budgetCreateValidation = require('../../validators/budget/create')
const VALID_KEYS = ['name', 'resetType', 'resetDate', 'usernames']
const categoryDefaults = require('../../helpers/defaults')

module.exports = (router, app, db) => {
  router.post('/', validate(budgetCreateValidation), async(req, res, next) => {
    let valid = VALID_KEYS
    console.log(valid)
    budget_json = await valid.map(async(key) => {
      let obj = {}

      if (key !== "usernames")
        obj[key] = req.body[key]
      else {
        if(req.body[key]!==undefined) {

          let usernames = req.body[key]
          let owner_ids = await usernames.map(async(username) => {
            let user = await db.User.findOne({username})
            if (!user) {
              res.sendStatus(400)
              res.json({
                error: {
                  message: 'A user not found'
                }
              })
            }


            return user.get('_id')
          })




          obj["owner_ids"] = owner_ids
        }
      }

      return obj
    }, {})

    Promise.all(budget_json).then(async (budget_json) => {
      budget_json = budget_json.reduce(function(map, obj) {

        map[Object.keys(obj)[0]] = Object.values(obj)[0];

        return map;
      }, {});

      Promise.all(budget_json.owner_ids).then(async(usernames) => {
        console.log(usernames)
        budget_json.owner_ids =  [req.user.get('_id')].concat(usernames)
        console.log(budget_json)
        let budget = new db.Budget(Object.assign({}, budget_json, categoryDefaults, {lastArchivalDate: moment.unix(0).toDate()}))
        await budget.save()
        res.json(budget.toJSON())
      })
    })
  })
}
