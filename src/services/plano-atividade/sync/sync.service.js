const core = require('./sync.core')
const hooks = require('./sync.hooks')

module.exports = function (app) {
  app.use('/plano-atividade/sync', core(app))
  const service = app.service('plano-atividade/sync')
  service.hooks(hooks)
}
