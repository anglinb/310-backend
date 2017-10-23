const moment = require('moment')
const app = require('./')
const Cron = require('./src/cron')
// (async () => {

console.log('fsdfjl')
let cron = Cron.build({ currentDate: moment(), db: app.db })
cron.run().then(() => {
  console.log('dsflkjf')
})
// })
