// Initializes the `poc` service on path `/poc`
const core = require('./plano-atividade.core')
const hooks = require('./plano-atividade.hooks')

module.exports = function (app) {
  // Initialize our service with any options it requires
  app.use('/plano-atividade', core(app))

  // Get our initialized service so that we can register hooks
  const service = app.service('plano-atividade')

  service.hooks(hooks)
}
