const _ = require('lodash')
const path = require('path')
const { mongoInstance } = require(path.resolve('./src/shared/mongo-connection'))

const splitCompany = (data) => {
  return _.chain(data)
    .groupBy('IdEmpresa')
    .map((value, key) => ({ company: key, data: value }))
    .value()
}

const toTrackingLog = (data) => {
  return {
    processId: data.processId,
    createdAt: new Date(),
    status: data.status,
    chunksRemaining: data.chunksRemaining
  }
}

const trackingLog = (app, dependencies) => {
  return mongoInstance(app.get('constants').reportPreferencesDatabase)
    .then(connection => {
      const logObject = toTrackingLog(dependencies)
      connection
        .collection(app.get('constants').syncTrackingLogCollection)
        .update(
          { processId: logObject.processId },
          logObject,
          { upsert: true })
    })
}

const commitPlan = (app, tasks) => {
  return Promise.all(splitCompany(tasks).map(data => {
    return mongoInstance(data.company)
      .then(connection => {
        const bulk = connection.collection(app.get('constants').activityPlanCollection).initializeOrderedBulkOp()
        bulk.find({ Tarefa: { $in: data.data.map(mp => mp.Tarefa) } }).remove()
        data.data.map(mp => {
          bulk.insert(mp)
        })
        bulk.execute()
      })
  })).then(() => {
    return tasks
  })
}

module.exports = {
  trackingLog,
  commitPlan
}
