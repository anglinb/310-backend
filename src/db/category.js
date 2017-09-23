const Transaction = require('./transaction')
const { Model } = require('mongorito')

class Category extends Model {
}

Category.embeds('transactions', Transaction)

module.exports = Category
