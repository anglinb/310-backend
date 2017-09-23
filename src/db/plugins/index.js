const plugins = require('require-dir')()

module.exports = (db) => {
  Object.keys(plugins).map((key) => {
    plugins[key](db)
  })
}
