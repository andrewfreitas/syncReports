const _ = require('lodash')

const discardFields = (obj) => {
  Object.keys(obj).forEach(key => !obj[key] && delete obj[key])
  return obj
}

const getApplications = (data) => {
  return data.map((mp) => {
    return discardFields({
      IdAplicacao: mp.IdAplicacao,
      Unidades: mp.Unidades,
      GrupoUnidades: mp.GrupoSites,
      SubGrupoUnides: mp.SubGrupoSite,
      Areas: mp.Areas
    })
  })
}

const toApplications = (data) => {
  return getApplications(data)
}

const toAudit = (data) => {
  return _.first(data.map(mp => {
    return discardFields({
      Responsavel: mp.RESPONSAVEL,
      IdAuditoria: mp.IDAUDITORIA,
      NomeAuditoria: mp.NOMEAUDITORIA,
      Unidade: mp.UNIDADE,
      DataVistoria: mp.DATAVISTORIA,
      StatusAuditoria: mp.STATUSAUDITORIA
    })
  }))
}

const getTasks = (data) => {
  return data.map((mp) => {
    return discardFields({
      Descricao: mp.DESCRICAO,
      DataPrevista: mp.DATAPREVISTA,
      DataRealizada: mp.DATAREALIZADA,
      Realizada: mp.REALIZADA,
      Status: mp.STATUS,
      TipoValidacao: mp.TIPOVALIDACAO,
      TipoValidacaoNome: mp.TIPOVALIDACAONOME,
      Tarefa: mp.task
    })
  })
}

const toTasks = (data) => {
  return getTasks(data)
}

const toPictures = (data) => {
  return {
    fotos: data.map(mp => {
      return {
        tarefa: mp.task,
        path: mp.FOTOPATH,
        Observacao: mp.OBSERVACAO
      }
    })
  }
}

const toResponse = (data) => {
  return data.map(response => {
    if (response.length) {
      return _.first(response.map((activityPlan, idx) => {
        return {
          PlanoAtividade: activityPlan.PLANOATIVIDADE,
          NomePlano: activityPlan.CHECKLISTNOME,
          audit: {
            Responsavel: activityPlan.RESPONSAVEL,
            IdAuditoria: activityPlan.AUDITORIAMANUTENCAO,
            NomeAuditoria: activityPlan.NOMEAUDITORIA,
            Unidade: activityPlan.UNIDADE,
            DataVistoria: activityPlan.DATAVISTORIA,
            StatusVistoria: activityPlan.STATUSAUDITORIA // alterar query
          },
          applications: [{
            GrupoUnidades: activityPlan.UNIDADE,
            tasks: getTasks(response),
            IdAplicacao: activityPlan.IDAPLICACAO,
            Areas: activityPlan.AREA,
            Unidades: activityPlan.UNIDADE,
            SubGrupoUnidades: activityPlan.SUBGRUPOUNIDADE
          }]
        }
      }))
    }
  })
}

module.exports = {
  toApplications,
  toAudit,
  toTasks,
  toPictures,
  toResponse
}
