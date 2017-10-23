const moment = require('moment')

class DateHelper {
  constructor ({currentDate = moment(), resetDate, resetType}) {
    this.currentDate = currentDate
    this.resetDate = resetDate
    this.resetType = resetType
  }

  nextResetDate () {
    let returnValue
    if (this.resetType === 'MONTH') {
      returnValue = this.nextResetDateMonth()
    } else {
      returnValue = this.nextResetDateWeek()
    }
    return returnValue
  }

  previousResetDate () {
    let returnValue
    if (this.resetType === 'MONTH') {
      returnValue = this.previousResetDateMonth()
    } else {
      returnValue = this.previousResetDateWeek()
    }
    return returnValue
  }

  nextResetDateMonth () {
    let nextResetDate
    let dayInCurrentMonth = this.currentDate.clone().date(this.resetDate)
    if (!this.currentDate.isBefore(dayInCurrentMonth)) {
      nextResetDate = dayInCurrentMonth.clone().add(1, 'months')
    } else {
      nextResetDate = dayInCurrentMonth
    }
    return nextResetDate
  }

  previousResetDateMonth () {
    let nextResetDate = this.nextResetDateMonth()
    return nextResetDate.clone().subtract(1, 'months')
  }

  nextResetDateWeek () {
    let nextResetDate
    let dayInCurrentMonth = this.currentDate.clone().date(this.resetDate)
    if (!this.currentDate.isBefore(dayInCurrentMonth)) {
      nextResetDate = dayInCurrentMonth.clone().add(7, 'days')
    } else {
      nextResetDate = dayInCurrentMonth
    }
    return nextResetDate
  }

  previousResetDateWeek () {
    let nextResetDate = this.nextResetDateWeek()
    return nextResetDate.clone().subtract(7, 'days')
  }
}

module.exports = DateHelper
