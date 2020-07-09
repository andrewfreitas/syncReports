const discardFields = (obj) => {
  Object.keys(obj).forEach(key => !obj[key] && delete obj[key])
  return obj
}

const toTasks = (data) => {
  return discardFields({
    Empresa: data.IDEMPRESA,
    Descricao: data.DESCRICAO,
    DataPrevista: data.DATAPREVISTA,
    DataRealizada: data.DATAREALIZADA,
    Realizada: data.REALIZADA,
    Status: data.STATUS,
    TipoValidacao: data.TIPOVALIDACAO,
    TipoValidacaoNome: data.TIPOVALIDACAONOME,
    Tarefa: data.TAREFA,
    application: discardFields({
      IdAplicacao: data.IDAPLICACAO,
      Unidades: data.UNIDADES,
      GrupoUnidades: data.GRUPOSITES,
      SubGrupoUnides: data.SUBGRUPOSITE,
      Areas: data.AREA
    }),
    audit: discardFields({
      Responsavel: data.RESPONSAVEL,
      IdAuditoria: data.IDAUDITORIA,
      NomeAuditoria: data.NOMEAUDITORIA,
      Unidade: data.UNIDADE,
      DataVistoria: data.DATAVISTORIA,
      StatusAuditoria: data.STATUSAUDITORIA
    })
  })
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

module.exports = {
  toTasks,
  toPictures
}
