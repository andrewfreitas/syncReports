const Cron = require('cron').CronJob
const {
  activityPlanTracking,
  activityPlanApplication,
  activityPlanAudits,
  activityPlanTasks
} = require('./query/sql/plano-atividade')
const { setTmp, commitPlan } = require('./query/mongo/plano-atividade')
const { toApplications, toAudit, toTasks } = require('./mapping/plano-atividade.toResponse')
const moment = require('moment')
const _ = require('lodash')

const splitCompany = (data) => {
  return _.chain(data)
    .groupBy('company')
    .map((value, key) => ({ company: key, data: value }))
    .value()
}

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

const getActivityPlanApplication = (app, envelope) => {
  const planoAtividade = envelope.map(mp => mp.PlanoAtividade).join(',')

  return app
    .get('knexInstance')
    .raw(activityPlanApplication(planoAtividade))
    .then(response => {
      envelope.map(mp => {
        mp.applications = toApplications(response.filter(f => f.planoAtividade === mp.PlanoAtividade))
      })
      return envelope
    })
}

const getActivityPlanAudit = (app, envelope) => {
  const planoAtividade = envelope.map(mp => mp.PlanoAtividade).join(',')

  return app
    .get('knexInstance')
    .raw(activityPlanAudits(planoAtividade))
    .then(response => {
      envelope.map(mp => {
        mp.audit = toAudit(response.filter(f => f.planoAtividade === mp.PLANOATIVIDADE))
      })
      return envelope
    })
}

const getActivityPlanTasks = (app, envelope) => {
  const idAplicacao = envelope.map(mp => mp.applications.map(mp => { return mp.IdAplicacao })).join(',')
  return app
    .get('knexInstance')
    .raw(activityPlanTasks(idAplicacao))
    .then(response => {
      envelope.map(mp => mp.applications.map(mp => {
        mp.tasks = toTasks(response.filter(f => f.application === mp.IdAplicacao))
      }))
      return envelope
    })
}

// const getX = (app) => (deps) => {
//   const envelope = {}
//   return addObject(envelope)(deps)
//     .then(getActivityPlanApplication(app, envelope))
//     .then(getActivityPlanAudit(app, envelope))
//     .then(getActivityPlanTasks(app, envelope))
//     .then(() => {
//       return envelope
//     })
// }

const startActivityPlanFlow = (app, params) => {
  return getActivityPlanTracking(app, params)
    .then(trackingPlans => {
      return getActivityPlanApplication(app, trackingPlans)
        .then(() => getActivityPlanAudit(app, trackingPlans))
        .then(() => getActivityPlanTasks(app, trackingPlans))
        .then(setTmp(app))
        .then(commitPlan(app))
    })
}

module.exports = (app) => {
  let job = {}
  return {
    async find (params) {
      return startActivityPlanFlow(app, params)
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
