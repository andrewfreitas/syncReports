const Cron = require('cron').CronJob
const {
  activityPlanTracking,
  activityPlanApplication,
  activityPlanAudits,
  activityPlanTasks
} = require('./query/sql/plano-atividade')
// const { trackingLog } = require('./query/mongo/tracking-log')
const { setTmp, commitPlan } = require('./query/mongo/plano-atividade')
const { toApplications, toAudit, toTasks } = require('./mapping/plano-atividade.toResponse')
const moment = require('moment')

const addObject = (envelope) => (data) => {
  return Promise.resolve(Object.assign(envelope, data))
}

const getActivityPlanTracking = (app, { preferences }) => {
  return app
    .get('knexInstance')
    .raw(activityPlanTracking(moment()
      .subtract(preferences.retroTime, preferences.retroTimeUnit)
      .format('YYYY-MM-DD HH:MM:ss')))
}

const getActivityPlanApplication = (app, envelope) => (deps) => {
  return app
    .get('knexInstance')
    .raw(activityPlanApplication(deps))
    .then(toApplications)
    .then(addObject(envelope))
}

const getActivityPlanAudit = (app, envelope) => (deps) => {
  return app
    .get('knexInstance')
    .raw(activityPlanAudits(envelope))
    .then(toAudit)
    .then(addObject(envelope))
}

const getActivityPlanTasks = (app, envelope) => (applx) => {
  return Promise.all(envelope.applications.map(mp => {
    return app
      .get('knexInstance')
      .raw(activityPlanTasks(envelope.company, mp))
      .then(toTasks)
      .then(addObject(mp))
  }))
}

const getX = (app) => (deps) => {
  const envelope = {}
  return addObject(envelope)(deps)
    .then(getActivityPlanApplication(app, envelope))
    .then(getActivityPlanAudit(app, envelope))
    .then(getActivityPlanTasks(app, envelope))
    .then(() => {
      return envelope
    })
}

const startActivityPlanFlow = (app, params) => {
  return getActivityPlanTracking(app, params)
    .then(trackingPlans => {
      Promise
        .all(trackingPlans.map(getX(app)))
        .then(setTmp(app))
        .then(commitPlan(app))
    })
}

module.exports = (app) => {
  let job = {}
  return {
    async find (params) {
      startActivityPlanFlow(app, params)
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
