const preferences = require('./preferences.core')
const hooks = require('./preferences.hooks')

module.exports = function (app) {
  app.use('/preferences', preferences(app))

  const service = app.service('preferences')

  service.hooks(hooks)
}
