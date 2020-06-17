const MongoClient = require('mongodb').MongoClient

module.exports = function (app) {
  const connection = process.env.MONGO_HOST_DB
  const database = connection.substr(connection.lastIndexOf('/') + 1)
  const mongoClient = MongoClient.connect(connection, { useNewUrlParser: true })
    .then(client => client.db(database))
  app.set('mongoClient', mongoClient)
}
