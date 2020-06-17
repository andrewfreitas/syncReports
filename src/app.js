const compress = require('compression')
const helmet = require('helmet')
const cors = require('cors')
const logger = require('./logger')
const constants = require('./constants')
require('dotenv').config()

const feathers = require('@feathersjs/feathers')
const configuration = require('@feathersjs/configuration')
const express = require('@feathersjs/express')

const middleware = require('./middleware')
const services = require('./services')
const appHooks = require('./app.hooks')
const mongodb = require('./mongodb')

const app = express(feathers())

app.configure(configuration())
app.use(helmet())
app.use(cors())
app.use(compress())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.configure(express.rest())
app.configure(mongodb)
app.configure(middleware)
app.configure(services)
app.use(express.notFound())
app.use(express.errorHandler({ logger }))
app.set('constants', constants)

app.hooks(appHooks)
require('./shared/sql-connection')(app)

module.exports = app
