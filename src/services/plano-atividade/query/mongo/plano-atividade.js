const moment = require('moment')
const _ = require('lodash')
const path = require('path')
const { mongoInstance } = require(path.resolve('./src/shared/mongo-connection'))

const generateHash = (dependencies) => {
  const {
    activityPlan,
    company
  } = dependencies

  return `${company}${activityPlan}${moment().format('YYYYMMDDHHmmss')}`
}

const splitCompany = (data) => {
  return _.chain(data)
    .groupBy('company')
    .map((value, key) => ({ company: key, data: value }))
    .value()
}

const trackingLogObject = (dependencies) => {
  return {
    hash: generateHash(dependencies),
    company: dependencies.company,
    reportName: 'planoAtividade',
    status: dependencies.status || 'INIT',
    date: moment().format('YYYY-MM-DD THH:mm:ss.sss')
  }
}

const trackingLog = (app) => (dependencies) => {
  app.get('mongoClient').then(db => {
    db.collection(app.get('constants').syncTrackingLogCollection).insert(trackingLogObject(dependencies))
  })
}

const setTmp = (app) => (envelope) => {
  return Promise.all(splitCompany(envelope).map(data => {
    return mongoInstance(data.company)
      .then(connection => {
        return connection
          .collection(app.get('constants').activityPlanCollectionTmp)
          .insert({
            createdAt: new Date(),
            data: data.data
          })
          .then(response => {
            return response
          })
      })
  })).then(() => {
    return envelope
  })
}

const commitPlan = (app) => (envelope) => {
  return splitCompany(envelope).map(data => {
    return mongoInstance(data.company)
      .then(connection => {
        const bulk = connection.collection(app.get('constants').activityPlanCollection).initializeOrderedBulkOp()
        bulk.find({ 'data.PlanoAtividade': { $in: envelope.map(mp => mp.PlanoAtividade) } }).remove()
        data.data.map(mp => {
          bulk.insert(mp)
        })
        bulk.execute()
      })
  })
}

module.exports = {
  trackingLog,
  setTmp,
  commitPlan
}
