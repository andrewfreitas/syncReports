const Cron = require('cron').CronJob
const { activityPlanTracking, activityPlanTasks, taskPictures, taskSignatures } = require('../query/sql/plano-atividade')
const { commitPlan, trackingLog } = require('../query/mongo/plano-atividade')
const { toTasks, toPictures, toSignatures } = require('../mapping/plano-atividade.toResponse')
const loFp = require('lodash/fp')
const EventEmitter = require('events')
const event = new EventEmitter()
const uuid = require('uuid')

let uniqueProcess
let job = {}
let chunks = []

/**
 * Return the quantity of chunks of connections generated to connect at the same time on database
 * @param {*} chunks Quantity of chunks of data
 * @param {*} preferences Preferences.splitConnections Quantity of splited connections with amount of data
 */
const splitConnections = (chunks, preferences) => loFp.chunk(preferences.splitConnections, chunks)

/**
 * Return the quantity of chunks of data will grouped at the same time
 * @param {*} chunks Quantity of chunks of data
 * @param {*} preferences Preferences.splitConnections Quantity of splited connections with amount of data
 */
const splitTasks = (chunks, preferences) => loFp.chunk(preferences.splitPlans, chunks)

/**
 * Apply identifier to every chunk
 * @param {*} chunks Chunks of data
 */
const applyIdentifier = (chunks) => {
  return chunks.map((chunk, idx) => {
    return {
      processId: uuid.v1(),
      company: loFp.first(chunk) && loFp.first(loFp.first(chunk).map(mp => mp.company)),
      data: chunk.map((mp, idx) => {
        return {
          id: `chunks${idx}`,
          data: mp.map(m => m.task).join(',')
        }
      })
    }
  })
}

event.on('starting', (app, chunks) => {
  const processChunk = chunks.pop()
  event.emit('logFlow', app, processChunk.company, 'PROCESSING', chunks.length)
  event.emit('queryTasks', app, processChunk)
})

event.on('queryTasks', (app, chunk) => {
  Promise.all(chunk
    .data.map(ch => {
      return app.get('knexInstance').raw(activityPlanTasks(ch.data))
    }))
    .then(response => {
      response = loFp.flatten(response).map(toTasks)
      event.emit('queryPictures', app, chunk, response)
    })
})

event.on('queryPictures', (app, chunk, tasks) => {
  Promise.all(chunk
    .data.map(ch => {
      return app.get('knexInstance').raw(taskPictures(ch.data))
    }))
    .then(response => {
      response = loFp.flatten(response).map(toPictures)
      tasks
        .map(task => {
          const pictures = response.filter(picture => picture.Tarefa === task.Tarefa)
          if (pictures.length) {
            task.pictures = pictures
          }
        })
      event.emit('querySignatures', app, chunk, tasks)
    })
})

event.on('querySignatures', (app, chunk, tasks) => {
  Promise.all(chunk
    .data.map(ch => {
      return app.get('knexInstance').raw(taskSignatures(ch.data))
    }))
    .then(response => {
      response = loFp.flatten(response).map(toSignatures)
      tasks
        .map(task => {
          const signatures = response.filter(signature => signature.Tarefa === task.Tarefa)
          if (signatures.length) {
            task.signatures = signatures
          }
        })
      event.emit('exportSync', app, chunk, tasks)
    })
})

event.on('exportSync', (app, chunk, planActivity) => {
  commitPlan(app, planActivity)
    .then(() => {
      if (!chunks.length) {
        event.emit('logFlow', app, chunk.company, 'FINISHED', chunks.length)
        console.log('finished')
        return
      }
      event.emit('starting', app, chunks)
    })
    .catch(() => {
      event.emit('logFlow', app, 'ERROR', chunk.length)
    })
})

event.on('logFlow', (app, company, status, chunkLength) => {
  trackingLog(app, { company: company, processId: uniqueProcess, status, chunksRemaining: chunkLength })
    .then(response => {
      return true
    })
})

const startActivityPlanFlow = (app, trackingQuery, preferences) => {
  return app
    .get('knexInstance')
    .raw(trackingQuery)
    .then(response => {
      chunks = splitTasks(response, preferences)
      chunks = splitConnections(chunks, preferences)
      chunks = applyIdentifier(chunks)
      event.emit('starting', app, chunks)
    })
}

module.exports = (app) => {
  return {
    async find (params) {
      uniqueProcess = uuid.v1()
      chunks = []
      startActivityPlanFlow(app, activityPlanTracking(params.query), params.preferences)
      return {
        jobRunning: false,
        manual: true
      }
    },
    async create (data, params) {
      uniqueProcess = uuid.v1()
      chunks = []
      job = new Cron(params.preferences.cronPattern, () => startActivityPlanFlow(app, activityPlanTracking(params.query), params.preferences), null, true)
      return {
        jobRunning: job.running,
        manual: false
      }
    },
    async remove (params) {
      job.stop()
      return {
        jobRunning: job.running,
        manual: false
      }
    }
  }
}
