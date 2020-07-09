const count = require('./count.core')
const hooks = require('./count.hooks')

module.exports = function (app) {
  app.use('/plano-atividade/count', count(app))
  const service = app.service('plano-atividade/count')

  service.hooks(hooks)
}
