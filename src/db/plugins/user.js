
module.exports =  (db) => {
  db.User.use((Model) => {
    Model.prototype.budgets = async function() {
      return db.Budget.find({ owner_id: this.get('_id') })
    }
  })
}
