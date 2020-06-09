const Cron = require('cron').CronJob
// require('dotenv').config()
const { activityPlanTracking, activityPlanFull } = require('./query/sql/plano-atividade')
const { trackingLog } = require('./query/mongo/tracking-log')
const { toResponse } = require('./plano-atividade.toResponse')
const moment = require('moment')

const getActivityPlanTracking = (app) => {
  return app
    .get('knexInstance')
    .raw(activityPlanTracking('2020-06-04 19:20:30.983'))
}

const getActivityPlan = (app) => ({ activityPlan, company }) => {
  return app
    .get('knexInstance')
    .raw(activityPlanFull(company, activityPlan))
}

const startActivityPlanFlow = (app) => {
  return getActivityPlanTracking(app)
    .then(trackingPlans => {
      trackingPlans.map(trackingLog(app))
      Promise
        .all(trackingPlans.map(getActivityPlan(app)))
        .then(toResponse)
    })
}

module.exports = (app) => {
  let job = {}
  return {
    async find (params) {
      // return getActivityPlanTracking(app)
      //   .then(trackingPlans => {
      //     Promise
      //       .all(trackingPlans.map(getActivityPlan(app)))
      //       .then(promises => {
      //         console.log(promises)
      //       })
      //   })
    },
    async create (data, params) {
      job = new Cron(params.preferences.cronPattern, () => startActivityPlanFlow(app), null, true)
      return {
        isRunning: job.running
      }
    },
    async remove (params) {
      job.stop()
      return {
        isRunning: job.running
      }
    }
  }
}
