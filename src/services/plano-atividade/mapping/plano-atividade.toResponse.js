const discardFields = (obj) => {
  Object.keys(obj).forEach(key => !obj[key] && delete obj[key])
  return obj
}

const toTasks = (data) => {
  return discardFields({
    Empresa: data.IDEMPRESA,
    DescricaoEmpresa: data.EMPRESA,
    PlanoAtividade: data.PLANOATIVIDADE,
    NomePlano: data.NOMEPLANO,
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
    Unidades: data.UNIDADES,
    GrupoUnidades: data.GRUPOSITES,
    SubGrupoUnides: data.SUBGRUPOSITE,
    Areas: data.AREA,
    Responsavel: data.RESPONSAVEL,
    IdAuditoria: data.IDAUDITORIA,
    NomeAuditoria: data.NOMEAUDITORIA,
    Unidade: data.UNIDADE,
    DataVistoria: data.DATAVISTORIA,
    StatusAuditoria: data.STATUSAUDITORIA,
    CQA: data.CQA,
    Observacoes: data.OBSERVACOES,
    ComentariosAuditoria: data.COMENTARIODAAUDITORIA
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
