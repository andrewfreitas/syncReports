const {
  getTrackingDateRange,
  getPreferences,
  validateParams
} = require('../../../hooks/plano-atividade')

module.exports = {
  before: {
    all: [getPreferences, getTrackingDateRange],
    find: [validateParams],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
}
