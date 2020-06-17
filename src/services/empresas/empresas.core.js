const query = require('./query/empresas')
const _ = require('lodash')
const { MongoClient } = require('mongodb')

const get = (app) => {
  return app
    .get('knexInstance')
    .raw(query.empresas)
    .then(response => {
      if (response.length) {
        return response.map(mp => {
          return {
            codigo: mp.codigo,
            nome: _.camelCase(mp.nome)
          }
        })
      }
    })
}

const create = (app) => {
  return get(app)
    .then(empresas => {
      empresas.map(empresa => {
        MongoClient
          .connect(`${process.env.MONGO_PREFERENCES_DB}/${empresa.codigo}_${empresa.nome}`)
          .then(connection =>
            connection
              .db(`${empresa.codigo}_${empresa.nome}`)
              .collection('empresa')
              .insert({
                codigo: empresa.codigo,
                nome: empresa.nome
              }))
      })

      return empresas
    })
}

module.exports = (app) => {
  return {
    async find (params) {
      return create(app)
    }
  }
}
