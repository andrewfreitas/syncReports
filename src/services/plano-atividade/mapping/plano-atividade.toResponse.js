const _ = require('lodash')

const getApplications = (data) => {
  return data.map((mp) => {
    return {
      IdAplicacao: mp.IdAplicacao,
      Unidades: mp.Unidades,
      GrupoUnidades: mp.GrupoSites,
      SubGrupoUnides: mp.SubGrupoSite,
      Areas: mp.Areas
    }
  })
}

const toApplications = (data) => {
  return {
    applications: getApplications(data)
  }
}

const getTasks = (data) => {
  return data.map((mp) => {
    return {
      Descricao: mp.DESCRICAO,
      DataPrevista: mp.DATAPREVISTA,
      DataRealizada: mp.DATAREALIZADA,
      Realizada: mp.REALIZADA,
      Status: mp.STATUS,
      TipoValidacao: mp.TIPOVALIDACAO,
      TipoValidacaoNome: mp.TIPOVALIDACAONOME,
      Tarefa: mp.task
    }
  })
}

const toTasks = (data) => {
  return {
    tasks: getTasks(data)
  }
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

const toAnomalies = (data) => {
  return {
    audit: data.map(mp => {
      return {
        Responsavel: mp.Responsavel
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
  toTasks,
  toPictures,
  toResponse
}
