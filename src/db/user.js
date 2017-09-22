const SALT_ROUNDS = 10
const bcrypt = require('bcrypt')
const { Model } = require('mongorito')

class User extends Model {

  async setPassword(password) {
    let hash = await bcrypt.hash(password,  SALT_ROUNDS)
    this.set('password', hash)
  }

  async checkPassword(password) {
    let storedPassword = this.get('password')
    return await bcrypt.compare(password, storedPassword)
  }
}

module.exports = User

