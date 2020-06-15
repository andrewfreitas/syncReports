const moment = require('moment')

const generateHash = (dependencies) => {
  const {
    activityPlan,
    company
  } = dependencies

  return `${company}${activityPlan}${moment().format('YYYYMMDDHHmmss')}`
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
  return app.get('mongoClient').then(db => {
    return db
      .collection(app.get('constants').activityPlanCollection)
      .insert({
        createdAt: new Date(),
        data: envelope
      })
      .then(response => {
        if (response.result.ok) {
          return envelope
        }
      })
  })
}

const removeData = (app) => (envelope) => {
  return app
    .get('mongoClient')
    .then(db => {
      return db
        .collection(app.get('constants').activityPlanCollection)
        .remove({ $or: envelope.map(mp => { return { 'data.PlanoAtividade': mp.PlanoAtividade } }) })
        .then(response => {
          console.log(response)
        })
    })
}

const commitPlan = (app) => (envelope) => {
  return app
    .get('mongoClient')
    .then(db => {
      const bulk = db.collection(app.get('constants').activityPlanCollection).initializeOrderedBulkOp()
      bulk.find({ 'data.PlanoAtividade': { $in: envelope.map(mp => mp.PlanoAtividade) } }).remove()
      envelope.map(mp => {
        bulk.insert(mp)
      })
      bulk.execute()
    })
}

module.exports = {
  trackingLog,
  setTmp,
  removeData,
  commitPlan
}
