const Category = require('./category')
const { Model } = require('mongorito')

class Budget extends Model {
}

Budget.embeds('categories', Category)

module.exports = Budget
