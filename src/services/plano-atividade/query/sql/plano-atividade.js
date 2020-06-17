
/**
 * Return the active companies
 */
const activityPlanTracking = (dateRange) => `
SELECT DISTINCT PLAN_ID as PlanoAtividade
      ,PA.NOME AS NomePlano
      ,COMPANY as company
  FROM [LEANKEEP].[DBO].[ACTIVITY_PLANS_TRACK_MONGO] TRACKING
 INNER JOIN [DBO].EMPRESAS COMPANY
    ON COMPANY.EMPRESA = TRACKING.COMPANY
 INNER JOIN [DBO].PLANOSATIVIDADES PA ON PA.PLANOATIVIDADE = TRACKING.PLAN_ID
   AND TRACKING.COMPANY = PA.EMPRESA
 WHERE TRACKING.LAST_DATE_CHANGED >= '${dateRange}'
   AND COMPANY.STATUS = 1
`

/**
 * Returns the IdApplication and applicationActivityPlan
 * @param {*} company
 * @param {*} activityPlan
 */
const activityPlanApplication = ({ company, PlanoAtividade }) => `
  DECLARE @Empresa int = ${company}
  DECLARE @PlanoAtividade int = ${PlanoAtividade}

  select  apa.AplicacaoPlanoAtividade as IdAplicacao,
    ${company} as company,
    (select IdentificacaoAmbiente + '/' +Nome as AreaNome from Areas with (nolock) where Area = apa.Area) as Areas,
    (select Nome as SiteNome from Sites with (nolock) where Site = apa.Site) as Unidades,
    (select Tag + '/' + Nome as EquipamentoNome from Equipamentos with (nolock) where Equipamento = apa.Equipamento) as Equipamentos,
          (Select (select Nome from GruposSites with(nolock) where GrupoSite = g.GrupoSite ) as NomeSubGrupo From SitesGruposSites g with(nolock) where g.Site = apa.Site ) as SubGrupoSite,
          (Select (select Nome from GruposDeGruposSites with(nolock) where GrupoDeGrupoSite = GG.GrupoDeGrupoSite ) as NomeGrupo From Sites S WITH (NOLOCK)
          Inner join SitesGruposSites G WITH(NOLOCK) on S.Site = G.Site
          Inner Join GruposSitesGruposDeGrupos GG WITH(NOLOCK) on GG.GrupoSite = G.GrupoSite
          Where S.Empresa = @Empresa
          And (S.Site = apa.Site)) as GrupoSites
  from    AplicacoesPlanoAtividade apa WITH(NOLOCK)
  where    apa.PlanoAtividade = @PlanoAtividade
  and  apa.Inativo = 0
  and  apa.Site in (select Site from Sites with (nolock) where Site = apa.Site and StatusSite = 2)
`

const activityPlanAudits = ({ company, PlanoAtividade }) => `
DECLARE @EMPRESA INT = ${company}
DECLARE @PLANOATIVIDADE INT = ${PlanoAtividade}
SELECT  PA.AUDITORIAMANUTENCAO AS IDAUDITORIA,
    AM.NOME AS NOMEAUDITORIA,
    (SELECT NOME FROM SITES WITH (NOLOCK) WHERE SITE = AM.SITE) AS UNIDADE,
    AM.DATAVISTORIA AS DATAVISTORIA,
    (SELECT NOME FROM STATUSAUDITORIAMANUTENCAO WITH(NOLOCK) WHERE STATUSAUDITORIAMANUTENCAO = AM.STATUS) AS STATUSAUDITORIA,
    (SELECT NOME FROM USUARIOS WITH(NOLOCK) WHERE USUARIO = AM.RESPONSAVEL) AS RESPONSAVEL,
    AM.COMENTARIOS AS COMENTARIODAAUDITORIA
FROM    PLANOSATIVIDADES PA WITH(NOLOCK)
INNER JOIN AUDITORIASMANUTENCAO AM WITH(NOLOCK) ON PA.AUDITORIAMANUTENCAO = AM.AUDITORIAMANUTENCAO
WHERE  PA.EMPRESA = @EMPRESA
AND    PA.STATUS = 1
AND    PA.AUDITORIAMANUTENCAO IS NOT NULL
AND    PA.PLANOATIVIDADE = @PLANOATIVIDADE
`

// /**
//  * Returns activty plan detail
//  */
const activityPlanTasks = (company, { IdAplicacao }) => `
  DECLARE @EMPRESA INT = ${company}
  DECLARE @APLICACAOPLANOATIVIDADE INT = ${IdAplicacao}

  SELECT  ${company} as company,
          TRF.TAREFA as task,
          TRF.DESCRICAO ,
          TRF.DATAPREVISTA ,
          TRF.DATAREALIZADA ,
          CAST(TRF.REALIZADA AS BIT) AS REALIZADA, --TRUE OR FALSE
          TRF.OBSERVACOES ,
          (SELECT NOME FROM STATUSTAREFAS ST WITH (NOLOCK) WHERE STATUSTAREFA = TRF.STATUS ) AS STATUS,
          (SELECT NOME FROM SISTEMASEMPRESAS WITH(NOLOCK) WHERE SISTEMAEMPRESA = AT.SISTEMAEMPRESA) AS SISTEMAEMPRESA,
                  (CASE
                                  WHEN AT.TIPOVALIDACAO = 1 THEN 'CONFORMIDADE'
                                  WHEN AT.TIPOVALIDACAO = 2 THEN 'AVALIAÇÃO'
                                  WHEN AT.TIPOVALIDACAO = 3 THEN 'TEXTO'
                  END
                  ) AS TIPOVALIDACAO,
          COALESCE(CF.NOME,AV.NOME,TRF.TEXTO) AS TIPOVALIDACAONOME,
          (SELECT NOME FROM DBO.TIPOSATIVIDADE WITH(NOLOCK) WHERE TIPOATIVIDADE = AT.TIPOATIVIDADE ) AS TIPOATIVIDADE ,
          ANL.CQA
  FROM    TAREFAS TRF WITH(NOLOCK)
  INNER JOIN APLICACOESPLANOATIVIDADE APA WITH(NOLOCK) ON TRF.APLICACAOPLANOATIVIDADE = APA.APLICACAOPLANOATIVIDADE
  INNER JOIN ATIVIDADES AT WITH(NOLOCK) ON TRF.ATIVIDADE = AT.ATIVIDADE
  LEFT JOIN ANOMALIAS ANL WITH(NOLOCK) ON TRF.TAREFA = ANL.TAREFA
  LEFT JOIN CONFORMIDADES CF WITH(NOLOCK) ON TRF.CONFORMIDADE  = CF.CONFORMIDADE
  LEFT JOIN AVALIACOES AV WITH(NOLOCK) ON TRF.AVALIACAO  = AV.AVALIACAO
  WHERE    TRF.APLICACAOPLANOATIVIDADE = @APLICACAOPLANOATIVIDADE
  AND  (APA.AREA NOT IN (SELECT A.AREA FROM AREAS A WHERE A.AREA = APA.AREA AND A.INATIVO = 1 ))
  AND  (APA.EQUIPAMENTO NOT IN (SELECT EQ.EQUIPAMENTO FROM EQUIPAMENTOS EQ WITH (NOLOCK) WHERE EQ.EQUIPAMENTO = APA.EQUIPAMENTO AND EQ.INATIVO = 1))
  AND ( EXISTS ( SELECT S.SITE FROM SITESGRUPOSSITES S  WITH (NOLOCK)
            INNER JOIN  GRUPOSSITES G WITH (NOLOCK) ON S.GRUPOSITE = G.GRUPOSITE
            WHERE G.STATUSGRUPOSITE = 1 AND S.SITE = APA.SITE)
  OR  NOT EXISTS ( SELECT S.SITE FROM SITESGRUPOSSITES S  WITH (NOLOCK) WHERE S.SITE = APA.SITE) OR APA.SITE IS NULL)
`

const taskPictures = (tasks) => `
  SELECT FTR.TAREFA as task,
         FTR.FOTOPATH,
         FTR.OBSERVACAO
   FROM  FOTOSTAREFAS FTR WITH (NOLOCK)
  WHERE  FTR.TAREFA IN (${tasks})
`

const taskSignatures = ({ task }) => `
  DECLARE @TAREFA INT = ${task}
  SELECT FA.TAREFA,FA.ASSINATURAPATH,
      (SELECT NOME FROM USUARIOS WITH(NOLOCK) WHERE USUARIO = FA.USUARIO ) AS USUARIO
  FROM   TAREFASASSINATURAS FA WITH (NOLOCK)
  WHERE  FA.TAREFA = @TAREFA
`

const activityPlanAnomalies = (company, tasks) => `

  DECLARE @EMPRESA INT = ${company}
  DECLARE @TAREFA INT = ${tasks || 0}

  SELECT  ANL.CQA ,
      (SELECT NOME FROM EMPRESAS WITH (NOLOCK) WHERE EMPRESA = ANL.EMPRESA) AS NOMEEMPRESA,
      (SELECT NOME FROM SITES WITH (NOLOCK) WHERE SITE = ANL.SITE) AS UNIDADE,
      ANL.ANOMALIA ,
      ANL.AUDITORIAMANUTENCAO ,
      (SELECT NOME FROM STATUSANOMALIA WITH (NOLOCK) WHERE STATUSANOMALIA = ANL.STATUS ) AS STATUSANOMLIA,
      ANL.DATAREGISTRO ,
      ANL.DATALIMITEEXECUCAO,
      ANL.DESCRICAO AS DESCRICAOANOMALIA,
      ANL.GID,
      ANL.ANOMALIATIPICA ,
      ANL.TIPICA,
      ANL.CENTROCUSTO,
      ANL.CUSTO
  FROM DBO.ANOMALIAS ANL WITH(NOLOCK)
  WHERE ANL.EMPRESA = @EMPRESA
  AND ANL.TAREFA IN (@TAREFA)
  AND ANL.SITE IN (SELECT SITE FROM SITES WITH (NOLOCK) WHERE SITE = ANL.SITE AND STATUSSITE = 2)
`
const activityPlanAnomaliesResponsable = (company, anomaly) => `
  DECLARE @Empresa int = ${company}
  DECLARE @Anomalia int = ${anomaly}
  select  anl.AuditoriaManutencao as IdAuditoria,
      am.Nome As NomeAuditoria,
      (select NomeFantasia from Empresas with(nolock) where Empresa = am.Empresa) as Empresa,
      (select Nome from Sites with (nolock) where Site = am.Site) as Unidade,
      am.DataVistoria As DataVistoria,
      (select Nome from StatusAuditoriaManutencao with(nolock) where StatusAuditoriaManutencao = am.Status) as StatusAuditoria,
      (select Nome from Usuarios with(nolock) where Usuario = am.Responsavel) as Responsavel,
      am.Comentarios as ComentarioDaAuditoria
  from    Anomalias anl WITH(NOLOCK)
  inner join AuditoriasManutencao am WITH(NOLOCK) on anl.AuditoriaManutencao = am.AuditoriaManutencao
  Where  anl.Empresa = @Empresa
  and    anl.AuditoriaManutencao is not null
  and    anl.Anomalia = @Anomalia
`

module.exports = {
  activityPlanTracking,
  activityPlanApplication,
  activityPlanAudits,
  activityPlanTasks,
  activityPlanAnomalies,
  activityPlanAnomaliesResponsable,
  taskPictures,
  taskSignatures
}
