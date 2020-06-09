const { Service } = require('feathers-mongodb')
const constants = require('./../../constants')

exports.Preferences = class Preferences extends Service {
  constructor (options, app) {
    super(options)

    app.get('mongoClient').then(db => {
      this.Model = db.collection(constants.reportPreferencesCollection)
    })
  }
}
