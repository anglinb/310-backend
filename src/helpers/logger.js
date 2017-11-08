const bunyan = require('bunyan')
  , bformat = require('bunyan-format')  
  , formatOut = bformat({ outputMode: 'short' })
module.exports = (app, db) =>  {
  let logger = bunyan.createLogger({
    name: 'app',
    stream: formatOut,
    level: process.env.LOG_LEVEL || 'debug'
  })
  if (app && !app.get('log')) {
    app.set('log', logger)
  }
  return logger
}