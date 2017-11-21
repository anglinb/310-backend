
module.exports = (db) => {
  db.Budget.use((Model) => {
    Model.prototype.owner = async function () {
      return db.User.findOne({ _id: this.get('owner_ids')[0] })
    }

    Model.prototype.archives = async function () {
      return db.BudgetArchive.find({ budget_id: this.get('_id') })
    }
  })
}
