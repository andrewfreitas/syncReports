// const Ajv = require('ajv')
// const { BadRequest } = require('@feathersjs/errors')
// const validateSchema = new Ajv().compile(require('../schemas/availability.schema.json'))

const getGuests = (paxGroupCandidates) => {
  return paxGroupCandidates.map(mp => mp.guest.map(guest => guest.age.map(age => age.$.value.concat(',')).join('').slice(0, -1))).join('+')
}

const validate = (ctx) => {
  // const valid = validateSchema(ctx.data)

  // if (!valid) {
  //   const error = new BadRequest()
  //   error.className = `${ctx.type} app.service('${ctx.path}').${ctx.method}()`
  //   error.message = validateSchema.errors.map(mp => mp.message)
  //   throw error
  // }

  return ctx
}

module.exports = {
  validate,
  getGuests
}
