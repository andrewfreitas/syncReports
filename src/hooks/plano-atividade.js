const { BadRequest } = require('@feathersjs/errors')
const moment = require('moment')

const getPreferences = async (ctx) => {
  ctx.params.preferences = await ctx.app
    .service('preferences')
    .find()
    .then(response =>
      response.find(f => f.name === 'planoAtividade')
    )
    .catch(error => {
      console.log(`CANNOT GET REPORT PREFERENCES :: ${error}`)
    })
  return ctx
}

const validateParams = (ctx) => {
  const {
    company,
    init,
    end
  } = ctx.params.query
  if (!company) {
    throw new BadRequest('The querystring param @company was not found')
  }
  if (!init) {
    throw new BadRequest('The querystring param @init was not found')
  }
  if (!end) {
    throw new BadRequest('The querystring param @init was not found')
  }
  return ctx
}

const getTrackingDateRange = (ctx) => {
  const {
    retroTime,
    retroTimeUnit
  } = ctx.params.preferences

  const {
    init,
    end,
    company
  } = ctx.params && ctx.params.query

  ctx.params.query = {
    init: init || moment().subtract(retroTime, retroTimeUnit).format('YYYY-MM-DD HH:MM:ss'),
    end: end || moment().format('YYYY-MM-DD HH:MM:ss'),
    company: company || 'COMPANY'
  }

  return ctx
}

module.exports = {
  getTrackingDateRange,
  validateParams,
  getPreferences
}
