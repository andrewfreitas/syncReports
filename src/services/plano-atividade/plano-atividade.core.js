const Cron = require('cron').CronJob
const {
  activityPlanTracking,
  activityPlanTasks
} = require('./query/sql/plano-atividade')
const { setTmp, commitPlan } = require('./query/mongo/plano-atividade')
const { toTasks } = require('./mapping/plano-atividade.toResponse')
const moment = require('moment')
const _ = require('lodash')
const loFp = require('lodash/fp')
const EventEmitter = require('events')
const myEmitter = new EventEmitter()
let chunks = []

myEmitter.on('starting', (app, chunks) => {
  myEmitter.emit('logFlow', 'splitWork in chunks')
  myEmitter.emit('splitWork', app, chunks)
})

// Responsavel por dividir as tasks em chunks de processamento
myEmitter.on('splitWork', (app, chunks) => {
  myEmitter.emit('logFlow', 'splitWork in chunks')
  // x.map((mp, idx) => { return { id: idx, data: mp } })
  myEmitter.emit('queryChunk', app, _.first(chunks))
})

// Responsavel por pegar o chunk, realizar a query e transformar em objeto
myEmitter.on('queryChunk', (app, chunk) => {
  myEmitter.emit('logFlow', 'quering the actually chunk')
  Promise.all(chunk
    .data.map(ch => {
      return app
        .get('knexInstance')
        .raw(activityPlanTasks(ch.data))
    }))
    .then(response => {
      response = _.flatten(response).map(toTasks)
      myEmitter.emit('exportSync', app, chunk, response)
    })
})

// Responsavel por gravar no mongo
myEmitter.on('exportSync', (app, chunk, planActivity) => {
  myEmitter.emit('logFlow', 'ready to save on mongo')
  setTmp(app, planActivity)
    .then(response => {
      myEmitter.emit('removeFromChunks', app, chunk)
    })
})

// Responsavel por logar o processamento
myEmitter.on('removeFromChunks', (app, chunk) => {
  myEmitter.emit('logFlow', 'removing processed chunk from chunk list pending')
  _.remove(chunks, (c) => c.index === chunk.index)
  if (!chunks.length) {
    console.log(moment().format('YYYY-MM-DD HH:MM:SS'))
    return
  }
  myEmitter.emit('starting', app, chunks)
})

myEmitter.on('logFlow', console.log)

const getTrackingDate = (params) => {
  return {
    init: (params.query && params.query.init) || moment()
      .subtract(params.preferences.retroTime, params.preferences.retroTimeUnit)
      .format('YYYY-MM-DD HH:MM:ss'),
    end: (params.query && params.query.end) || moment().format('YYYY-MM-DD HH:MM:ss'),
    company: params.query.company || 'COMPANY'
  }
}

const getActivityPlanTracking = (app, params) => {
  const trackingQuery = activityPlanTracking(getTrackingDate(params))

  return app
    .get('knexInstance')
    .raw(trackingQuery)
    .then(response => {
      chunks = splitTasks(response)
      chunks = splitConnections(chunks)
      chunks = applyIdentifier(chunks)
      myEmitter.emit('starting', app, chunks)
    })
}

const splitConnections = (chunks) => loFp.chunk(30, chunks)
const splitTasks = (chunks) => loFp.chunk(30, chunks)
const applyIdentifier = (chunks) => {
  return chunks.map((chunk, idx) => {
    return {
      index: `splitConn${idx}`,
      data: chunk.map((mp, idx) => {
        return {
          id: `chunks${idx}`,
          data: mp.map(m => m.task).join(',')
        }
      })
    }
  })
}

const startActivityPlanFlow = (app, params) => {
  console.log(moment().format('YYYY-MM-DD HH:MM:SS'))
  return getActivityPlanTracking(app, params)
    .then(trackingPlans => {
      // .then(setTmp(app))
      // .then(commitPlan(app))
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
