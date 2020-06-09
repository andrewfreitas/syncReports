const { MongoClient } = require('mongodb')

const mongoInstance = (app) => {
  return MongoClient.connect(process.env.MONGO_HOST)
    .then(connection => {
      return connection
      // .db('LeankeepReports')
      // .collection('plano_atividades')
      // .find({})
      // .toArray()
      // .then(response => {
      //   connection.close()
      //   console.log(response.data)
      // })
    })
}

module.exports = (app) => {
  app.set('mongoInstance', mongoInstance(app))
}
