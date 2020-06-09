const poc = require('./plano-atividade/plano-atividade.service')
const empresas = require('./empresas/empresas.service.js')
const preferences = require('./preferences/preferences.service.js')
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(poc)
  app.configure(empresas)
  app.configure(preferences)
}
