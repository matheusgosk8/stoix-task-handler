import path from 'path'
import fs from 'fs-extra'
import type { ListEntityConfig } from '../types/generator-types'
import type { RollbackContext } from '../utils/rollback'
import { getNamingVariations } from '../utils/naming'

const ACTIONS_FILE_PATH = 'src/app/server/actions.ts'

/**
 * Registra a server action no arquivo actions.ts
 */
export function registerServerAction(entity: ListEntityConfig, baseDir: string, rollbackCtx?: RollbackContext) {
  if (!entity.serverAction?.enabled) {
    console.log('⏭️  Server Action desabilitado para esta entity')
    return
  }

  if (!entity.fakeDb?.enabled) {
    throw new Error('FakeDB precisa estar habilitado para gerar Server Action')
  }

  const { listFn, getByIdFn } = entity.serverAction
  const names = getNamingVariations(entity.name)

  // Paths
  const actionsFilePath = path.resolve(baseDir, ACTIONS_FILE_PATH)

  if (!fs.existsSync(actionsFilePath)) {
    throw new Error(`Arquivo actions.ts não encontrado: ${actionsFilePath}`)
  }

  // Lê o arquivo atual
  let content = fs.readFileSync(actionsFilePath, 'utf-8')

  // Salva snapshot para rollback
  if (rollbackCtx) {
    rollbackCtx.modifiedFiles.push({
      path: actionsFilePath,
      content
    })
  }

  // Gera o import path do fake-db (remove 'src/' e '.ts')
  const fakeDbImportPath = entity.fakeDb.path.replace('src/', '@/').replace('.ts', '')

  // Nome da variável do import (ex: bookProductData)
  const importVarName = `${names.camel}Data`

  // 1️⃣ Adiciona o import
  const importStatement = `import { db as ${importVarName} } from '${fakeDbImportPath}'`

  // Procura a última linha de import
  const lastImportIndex = content.lastIndexOf('import { db as')

  if (lastImportIndex === -1) {
    throw new Error('Não foi possível encontrar imports no arquivo actions.ts')
  }

  // Encontra o final da linha do último import
  const lastImportEnd = content.indexOf('\n', lastImportIndex)

  // Insere o novo import
  content = content.slice(0, lastImportEnd + 1) + importStatement + '\n' + content.slice(lastImportEnd + 1)

  // 2️⃣ Adiciona a função listFn (obrigatória)
  const listFunction = `
export const ${listFn} = async () => {
  return ${importVarName}
}
`

  // Adiciona ao final do arquivo
  content += listFunction

  // 3️⃣ Adiciona a função getByIdFn (opcional)
  if (getByIdFn) {
    const getByIdFunction = `
export const ${getByIdFn} = async (id: string) => {
  return ${importVarName}.find(item => item.id === id)
}
`
    content += getByIdFunction
  }

  // Escreve o arquivo atualizado
  fs.writeFileSync(actionsFilePath, content, 'utf-8')

  console.log(`✅ Server Action registrada: ${listFn}`)
  if (getByIdFn) {
    console.log(`✅ Server Action registrada: ${getByIdFn}`)
  }

  return actionsFilePath
}
