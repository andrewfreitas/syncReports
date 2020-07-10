const sync = require('./plano-atividade/sync/sync.service')
const preferences = require('./preferences/preferences.service.js')
const planoAtividadeCount = require('./plano-atividade/count/count.service.js')
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(sync)
  app.configure(preferences)
  app.configure(planoAtividadeCount)
}
