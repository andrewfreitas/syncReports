const { MongoClient } = require('mongodb')

const mongoInstance = (company) => {
  return MongoClient.connect(`${process.env.MONGO_HOST}/${company}`, { useNewUrlParser: true })
    .then(client => client.db(company))
}

module.exports = {
  mongoInstance
}
