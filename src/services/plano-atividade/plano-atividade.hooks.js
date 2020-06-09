
module.exports = {
  before: {
    all: [async (ctx) => {
      ctx.params.preferences = await ctx.app.service('preferences').find().then(response => response.data.find(f => f.name === 'planoAtividade'))
    }],
    find: [],
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
