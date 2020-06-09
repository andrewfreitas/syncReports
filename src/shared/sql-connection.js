const knexInstance = require('knex')({
  client: 'mssql',
  connection: {
    host: process.env.SQL_HOST,
    port: Number(process.env.SQL_PORT || 0),
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DATABASE
  }
})

module.exports = (app) => {
  app.set('knexInstance', knexInstance)
}
