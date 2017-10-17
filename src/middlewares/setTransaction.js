module.exports = (app, db) => {
  return (req, res, next) => {
    let transactions = req.category.get('transactions') || []
    let targetIndex = categories.findIndex((value) => {
      return req.params.transactionId === value.get('_id')
    })
    if (targetIndex === -1) {
      res.sendStatus(404)
      return
    }
    req.transaction = transactions[targetIndex]
    req.transactionIndex = targetIndex
    next()
  }
}
