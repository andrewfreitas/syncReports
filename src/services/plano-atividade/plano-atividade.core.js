const Cron = require('cron').CronJob
const {
  activityPlanTracking,
  activityPlanApplication,
  activityPlanTasks
  // activityPlanAnomalies,
  // taskPictures,
  // taskSignatures
} = require('./query/sql/plano-atividade')
// const { trackingLog } = require('./query/mongo/tracking-log')
const { setTmp, removeData, commitPlan } = require('./query/mongo/plano-atividade')
const { toApplications, toTasks } = require('./mapping/plano-atividade.toResponse')
const moment = require('moment')

const getActivityPlanTracking = (app) => {
  return app
    .get('knexInstance')
    .raw(activityPlanTracking('2020-04-04 19:20:30.983'))
}

const getActivityPlanApplication = (app, envelope) => (deps) => {
  return app
    .get('knexInstance')
    .raw(activityPlanApplication(deps))
    .then(toApplications)
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

const addObject = (envelope) => (data) => {
  return Promise.resolve(Object.assign(envelope, data))
}

const getX = (app) => (deps) => {
  const envelope = {}
  return addObject(envelope)(deps)
    .then(getActivityPlanApplication(app, envelope))
    .then(getActivityPlanTasks(app, envelope))
    .then(() => {
      return envelope
    })
}

const startActivityPlanFlow = (app) => {
  return getActivityPlanTracking(app)
    .then(trackingPlans => {
      return Promise
        .all(trackingPlans.map(getX(app)))
        .then(setTmp(app))
        .then(commitPlan(app))
    })
}

module.exports = (app) => {
  let job = {}
  return {
    async find (params) {
      return startActivityPlanFlow(app)
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

// const getActivityPlanAnomalies = (app, envelope) => (applx) => {
//   return Promise.all(envelope.applications.map(mp => {
//     return app
//       .get('knexInstance')
//       .raw(getActivityPlanAnomalies(envelope.company, mp.tasks.map(task => task.Tarefa).join(',')))
//       .then(toTasks)
//       .then(addObject(mp))
//   }))
// }

// const getPictures = (app) => (tasks) => {
//   const taskParams = tasks[0].map(mp => mp.task).join(',')
//   return app
//     .get('knexInstance')
//     .raw(taskPictures(taskParams))
//     .then(response => {
//       if (response.length) {
//         return response.map(mp => {
//           return {
//             tarefa: mp.task,
//             path: mp.FOTOPATH,
//             Observacao: mp.OBSERVACAO
//           }
//         })
//       } else {
//         return null
//       }
//     })
// }

// const getSignatures = (app) => (tasks) => {
//   const taskParams = tasks[0].map(mp => mp.task).join(',')
//   return app
//     .get('knexInstance')
//     .raw(taskSignatures(taskParams))
//     .then(response => {
//       if (response.length) {
//         return response.map(mp => {
//           return {
//             tarefa: mp.task,
//             path: mp.ASSINATURAPATH,
//             Usuario: mp.USUARIO
//           }
//         })
//       } else {
//         return null
//       }
//     })
// }
