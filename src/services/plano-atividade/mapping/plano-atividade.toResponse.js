const discardFields = (obj) => {
  Object.keys(obj).forEach(key => (obj[key] === null || obj[key] === undefined) && delete obj[key])
  return obj
}

const toTasks = (data) => {
  return discardFields({
    IdEmpresa: data.IDEMPRESA,
    Empresa: data.EMPRESA,
    IdPlanoAtividade: data.PLANOATIVIDADE,
    PlanoAtividade: data.NOMEPLANO,
    Descricao: data.DESCRICAO,
    Equipamento: data.EQUIPAMENTO,
    DataPrevista: data.DATAPREVISTA,
    DataRealizada: data.DATAREALIZADA,
    Sistema: data.SISTEMAEMPRESA,
    Realizada: data.REALIZADA,
    Status: data.STATUS,
    TipoAtividade: data.TIPOATIVIDADE,
    TipoValidacao: data.TIPOVALIDACAO,
    TipoValidacaoNome: data.TIPOVALIDACAONOME,
    Tarefa: data.TAREFA,
    IdAplicacao: data.IDAPLICACAO,
    GrupoSites: data.GRUPOSITES,
    SubGrupoSite: data.SUBGRUPOSITE,
    Areas: data.AREA,
    Responsavel: data.RESPONSAVEL,
    IdAuditoria: data.IDAUDITORIA,
    NomeAuditoria: data.NOMEAUDITORIA,
    Unidade: data.UNIDADE,
    DataVistoria: data.DATAVISTORIA,
    StatusAuditoria: data.STATUSAUDITORIA,
    CQA: data.CQA,
    Observacoes: data.OBSERVACOES,
    ComentariosAuditoria: data.COMENTARIODAAUDITORIA,
    IdUnidade: data.IDUNIDADE,
    IdEquipamento: data.IDEQUIPAMENTO,
    IdArea: data.IDAREA,
    IdSistema: data.IDSISTEMA
  })
}

const toPictures = (data) => {
  return discardFields({
    tarefa: data.TAREFA,
    path: data.FOTOPATH,
    Observacao: data.OBSERVACAO
  })
}

const toSignatures = (data) => {
  return discardFields({
    Usuario: data.USUARIO,
    Tarefa: data.TAREFA,
    AssinaturaPath: data.ASSINATURAPATH
  })
}

module.exports = {
  toTasks,
  toPictures,
  toSignatures
}
