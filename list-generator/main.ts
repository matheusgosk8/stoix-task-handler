import path from 'path'

import fs from 'fs-extra'
import prompts from 'prompts'

import { writeTypes } from './writters/types.writter'
import { writeFakeDb } from './writters/fake-db.writter'
import { writeColumns } from './writters/columns.writter'
import { writeHooks } from './writters/hooks.writter'
import { writeFilters } from './writters/filters.writter'
import { writeListTable } from './writters/list.writter'
import { writePageFiles } from './writters/page.writter'
import { registerServerAction } from './registers/server-action.register'
import { createRollbackContext, saveRollbackContext, autoRollbackIfExists } from './utils/rollback'
import type { ListEntityConfig } from './types/generator-types'

function log(step: string) {
  console.log(`🔹 ${step}`)
}

function success(message: string) {
  console.log(`✅ ${message}`)
}

function fail(message: string, error?: unknown): never {
  console.error(`❌ ${message}`)

  if (error instanceof Error) {
    console.error(error.message)
    console.error(error.stack)
  }

  process.exit(1)
}

/**
 * Lista todos os arquivos .entity.ts disponíveis
 */
function listEntityFiles(): string[] {
  const entitiesDir = path.resolve(process.cwd(), 'list-generator/entity')

  if (!fs.existsSync(entitiesDir)) {
    fail(`Diretório de entities não encontrado: ${entitiesDir}`)
  }

  const files = fs
    .readdirSync(entitiesDir)
    .filter(file => file.endsWith('.entity.ts'))
    .sort()

  if (files.length === 0) {
    fail('Nenhuma entity encontrada no diretório list-generator/entity/')
  }

  return files
}

/**
 * Carrega uma entity dinamicamente
 */
async function loadEntity(fileName: string): Promise<ListEntityConfig> {
  const entityPath = path.resolve(process.cwd(), 'list-generator/entity', fileName)

  try {
    const module = await import(entityPath)

    // Procura pela entity exportada (normalmente tem sufixo Entity)
    const entityKey = Object.keys(module).find(key => key.toLowerCase().includes('entity'))

    if (!entityKey || !module[entityKey]) {
      fail(`Nenhuma entity exportada encontrada em ${fileName}`)
    }

    return module[entityKey] as ListEntityConfig
  } catch (error) {
    fail(`Erro ao carregar entity ${fileName}`, error)
  }
}

/**
 * Seleciona a entity interativamente
 */
async function selectEntity(): Promise<{ fileName: string; entity: ListEntityConfig }> {
  const entityFiles = listEntityFiles()

  log(`Encontradas ${entityFiles.length} entities`)

  const choices = entityFiles.map(file => ({
    title: file.replace('.entity.ts', ''),
    value: file,
    description: file
  }))

  const response = await prompts({
    type: 'select',
    name: 'entityFile',
    message: 'Selecione a entity para gerar:',
    choices,
    initial: 0
  })

  if (!response.entityFile) {
    fail('Nenhuma entity selecionada')
  }

  const entity = await loadEntity(response.entityFile)

  return {
    fileName: response.entityFile,
    entity
  }
}

/**
 * Função principal
 */
async function main() {
  try {
    console.log('\n🚀 Gerador de Lista - Frontend\n')

    // Cria contexto de rollback
    const rollbackCtx = createRollbackContext()

    // Seleciona a entity
    const { fileName, entity } = await selectEntity()

    log(`Entity selecionada: ${entity.name}`)
    log(`Label: ${entity.label}`)

    if (entity.description) {
      log(`Descrição: ${entity.description}`)
    }

    // Valida se tem model definido
    if (!entity.model) {
      fail('Entity precisa ter um model definido para gerar os arquivos')
    }

    console.log('\n📝 Iniciando geração de arquivos...\n')

    // 1️⃣ Gera os Types
    log('1/8 - Gerando arquivo de Types')
    const baseDir = process.cwd()
    const typesPath = writeTypes(entity, baseDir, rollbackCtx)

    success(`Types gerado: ${path.relative(baseDir, typesPath)}`)

    // 2️⃣ Gera o FakeDB
    log('2/8 - Gerando FakeDB')
    const fakeDbPath = writeFakeDb(entity, baseDir, rollbackCtx)
    if (fakeDbPath) {
      success(`FakeDB gerado: ${path.relative(baseDir, fakeDbPath)}`)
    }

    // 3️⃣ Registra Server Action
    log('3/8 - Registrando Server Action')
    const actionPath = registerServerAction(entity, baseDir, rollbackCtx)
    if (actionPath) {
      success('Server Action registrada no actions.ts')
    }

    // 4️⃣ Gera Columns
    log('4/8 - Gerando Columns Config')
    const columnsResult = await writeColumns(entity, baseDir)
    if (columnsResult.created.length > 0) {
      rollbackCtx.createdFiles.push(...columnsResult.created)
      success(`Columns gerado: ${path.relative(baseDir, columnsResult.created[0])}`)
    }

    // 5️⃣ Gera Hooks
    log('5/8 - Gerando Hooks')
    const hooksResult = await writeHooks(entity, baseDir)
    if (hooksResult.created.length > 0) {
      rollbackCtx.createdFiles.push(...hooksResult.created)
      success(`Hooks gerado: ${path.relative(baseDir, hooksResult.created[0])}`)
    }

    // 6️⃣ Gera Filters
    log('6/8 - Gerando Filters')
    const filtersResult = await writeFilters(entity, baseDir)
    if (filtersResult.created.length > 0) {
      rollbackCtx.createdFiles.push(...filtersResult.created)
      success(`Filters gerado: ${path.relative(baseDir, filtersResult.created[0])}`)
    }

    // 7️⃣ Gera ListTable
    log('7/8 - Gerando ListTable')
    const listTableResult = await writeListTable(entity, baseDir)
    if (listTableResult.created.length > 0) {
      rollbackCtx.createdFiles.push(...listTableResult.created)
      success(`ListTable gerado: ${path.relative(baseDir, listTableResult.created[0])}`)
    }

    // 8️⃣ Gera Page e List Index
    log('8/8 - Gerando Page (SSR) e List Index')
    const pageResult = await writePageFiles(entity, baseDir)
    if (pageResult.created.length > 0) {
      rollbackCtx.createdFiles.push(...pageResult.created)
      success(`Page gerado: ${path.relative(baseDir, pageResult.created[0])}`)
      success(`List Index gerado: ${path.relative(baseDir, pageResult.created[1])}`)
    }

    // TODO: Adicionar outros writers aqui conforme forem sendo criados
    // log('4/X - Gerando Page')
    // writePage(entity, baseDir, rollbackCtx)

    // log('5/X - Gerando Hooks')
    // writeHooks(entity, baseDir, rollbackCtx)

    // log('6/X - Gerando Componentes')
    // writeComponents(entity, baseDir, rollbackCtx)

    // Salva o contexto de rollback
    log('Salvando contexto de rollback')

    const filesGenerated: Record<string, any> = {}
    if (typesPath) filesGenerated.types = path.relative(baseDir, typesPath)
    if (fakeDbPath) filesGenerated.fakeDb = path.relative(baseDir, fakeDbPath)
    if (actionPath) {
      filesGenerated.serverActions = [entity.serverAction?.listFn]
      if (entity.serverAction?.getByIdFn) {
        filesGenerated.serverActions.push(entity.serverAction.getByIdFn)
      }
    }
    if (columnsResult?.created.length > 0) {
      filesGenerated.columns = columnsResult.created.map(p => path.relative(baseDir, p))
    }
    if (hooksResult?.created.length > 0) {
      filesGenerated.hooks = hooksResult.created.map(p => path.relative(baseDir, p))
    }
    if (filtersResult?.created.length > 0) {
      filesGenerated.filters = filtersResult.created.map(p => path.relative(baseDir, p))
    }
    if (listTableResult?.created.length > 0) {
      filesGenerated.listTable = listTableResult.created.map(p => path.relative(baseDir, p))
    }
    if (pageResult?.created.length > 0) {
      filesGenerated.page = pageResult.created.map(p => path.relative(baseDir, p))
    }

    const rollbackFile = saveRollbackContext(rollbackCtx, {
      name: entity.name,
      baseDir: 'list-generator/logs/list',
      metadata: {
        label: entity.label,
        description: `Gerou ${Object.keys(filesGenerated).join(', ')}`,
        filesGenerated
      }
    })

    success(`Rollback salvo: ${path.relative(baseDir, rollbackFile)}`)

    console.log('\n✨ Geração concluída com sucesso!\n')
    console.log('📋 Próximos passos:')
    console.log('   1. Verifique os arquivos gerados')
    console.log('   2. Execute: pnpm lint:fix')
    console.log('   3. Teste a nova listagem\n')
    console.log('💡 Para reverter, execute: pnpm rollback:list\n')
  } catch (error) {
    fail('Erro inesperado durante a geração', error)
  }
}

// Executa o main
main()
