const { activityPlanTracking } = require('../query/sql/plano-atividade')

const startActivityPlanFlow = (app, trackingQuery) => {
  return app
    .get('knexInstance')
    .raw(trackingQuery)
    .then(response => {
      return response.length
    })
}

module.exports = (app) => {
  return {
    async find (params) {
      const syncLength = await startActivityPlanFlow(app, activityPlanTracking(params.query))
      return {
        syncLength
      }
    }
  }
}
