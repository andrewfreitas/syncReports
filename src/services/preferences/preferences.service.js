// Initializes the `preferences` service on path `/preferences`
const { Preferences } = require('./preferences.core')
const hooks = require('./preferences.hooks')

module.exports = function (app) {
  const options = {
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use('/preferences', new Preferences(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('preferences')

  service.hooks(hooks)
}
