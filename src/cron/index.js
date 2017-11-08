const moment = require('moment')
const notificationsFactory = require('./notifications')
const archiverFactory = require('./archiver')

class Cron {
  static build ({currentDate = moment(), db, app}) {
    return new Cron({currentDate, db, app})
  }

  constructor ({currentDate = moment(), db, app}) {
    this.db = db
    this.app = app
    this.currentDate = currentDate

    this.archiverCls = archiverFactory(this.app, this.db)
    this.notifierCls = notificationsFactory(this.app, this.db)
  }

  async run () {
    // We actually do want to run this before sending notifications b/c we don't want to alert you 
    // about something that is now irreverent. 
    let archiver = new this.archiverCls({ currentDate: this.currentDate })
    await archiver.run()
    let notifier = new this.notifierCls({ currentDate: this.currentDate })
    await notifier.run()
  }
}

module.exports = Cron
