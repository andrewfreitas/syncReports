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
    db.collection('syncTrackingLog').insert(trackingLogObject(dependencies))
  })
}

module.exports = {
  trackingLog
}
