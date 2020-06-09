// Initializes the `empresas` service on path `/empresas`
const createService = require('./empresas.core')
const hooks = require('./empresas.hooks')

module.exports = function (app) {
  // Initialize our service with any options it requires
  app.use('/empresas', createService(app))

  // Get our initialized service so that we can register hooks
  const service = app.service('empresas')

  service.hooks(hooks)
}
