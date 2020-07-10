const { MongoClient } = require('mongodb')

const mongoInstance = (company) => {
  return MongoClient.connect(`${process.env.MONGO_HOST}/${company}?ignoreUndefined=true`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(client => client.db(company))
}

module.exports = {
  mongoInstance
}
