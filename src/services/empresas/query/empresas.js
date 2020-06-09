
/**
 * Return the active companies
 */
const empresas = `
SELECT TOP(2) EMPRESA AS codigo
      ,nome
  FROM [LEANKEEP].[DBO].[EMPRESAS]
  WHERE STATUS = 1
`

module.exports = {
  empresas
}
