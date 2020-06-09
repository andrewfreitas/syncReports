
const toResponse = (data) => {
  console.log(data)

  data.map(response => {
    response.map(activityPlan => {
      return {
        nomePlano: activityPlan
      }
    })
  })
}

module.exports = {
  toResponse
}
