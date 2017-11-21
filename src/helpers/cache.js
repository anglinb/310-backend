const Cache = require('ttl');

 module.exports = (app, db) => {
   let cache = new Cache({
       ttl: 10 * 1000,
       capacity: 100
   })
   app.set('cache', cache)
 }

