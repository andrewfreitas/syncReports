const path = require('path')
const { mongoInstance } = require(path.resolve('./src/shared/mongo-connection'))

const getPreferences = (app) => {
  return mongoInstance(app.get('constants').reportPreferencesDatabase)
    .then(connection => {
      return connection
        .collection(app.get('constants').reportPreferencesCollection)
        .find({})
        .toArray()
        .then(response => {
          return response
        })
    })
}

module.exports = (app) => {
  return {
    async find (params) {
      return getPreferences(app, params)
    }
  }
}
