const moment = require('moment')
const app = require('./')
const cronFactory = require('./src/cron')
let CronCls = cronFactory(app, app.db)
let cron = new CronCls({ currentDate: moment() })
process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});
cron.run()