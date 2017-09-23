const Transaction = require('./transaction')
const { Model } = require('mongorito')

class Category extends Model {
  static createSlug (name) {
    return name
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-')
  }
}

Category.embeds('transactions', Transaction)

module.exports = Category
