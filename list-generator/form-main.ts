import path from 'path'

import fs from 'fs-extra'
import prompts from 'prompts'

import { writeFormComponent } from './writters/form-component.writter'
import { writeFormHooks } from './writters/form-hooks.writter'
import { writeFormValidate } from './writters/form-validate.writter'
import { writeFormPages } from './writters/form-pages.writter'
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
    message: 'Selecione a entity para gerar formulário:',
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
    console.log('\n🚀 Gerador de Formulário - Frontend\n')

    // Cria contexto de rollback
    const rollbackCtx = createRollbackContext()

    // Seleciona a entity
    const { fileName, entity } = await selectEntity()

    log(`Entity selecionada: ${entity.name}`)
    log(`Label: ${entity.label}`)

    // Valida se tem form definido
    if (!entity.form) {
      fail('Entity precisa ter um form definido para gerar os arquivos')
    }

    console.log('\n📝 Iniciando geração de arquivos de formulário...\n')

    // 1️⃣ Gera o Componente do Form
    log('1/4 - Gerando componente Form')
    const baseDir = process.cwd()
    const formComponentResult = await writeFormComponent(entity, baseDir)
    rollbackCtx.createdFiles.push(...formComponentResult.created)
    success(`Form gerado: ${path.relative(baseDir, formComponentResult.created[0])}`)

    // 2️⃣ Gera os Hooks
    log('2/4 - Gerando Hooks do Form')
    const formHooksResult = await writeFormHooks(entity, baseDir)
    rollbackCtx.createdFiles.push(formHooksResult.hook, formHooksResult.types)
    success(`Hook gerado: ${path.relative(baseDir, formHooksResult.hook)}`)
    success(`Types gerado: ${path.relative(baseDir, formHooksResult.types)}`)

    // 3️⃣ Gera a Validação
    log('3/4 - Gerando Validação (Zod)')
    const formValidatePath = await writeFormValidate(entity, baseDir)
    rollbackCtx.createdFiles.push(formValidatePath)
    success(`Validate gerado: ${path.relative(baseDir, formValidatePath)}`)

    // 4️⃣ Gera as Pages
    log('4/4 - Gerando Pages (Create e Edit)')
    const formPagesResult = await writeFormPages(entity, baseDir)
    rollbackCtx.createdFiles.push(formPagesResult.create, formPagesResult.edit)
    success(`Create Page gerado: ${path.relative(baseDir, formPagesResult.create)}`)
    success(`Edit Page gerado: ${path.relative(baseDir, formPagesResult.edit)}`)

    // Salva o contexto de rollback
    log('Salvando contexto de rollback')

    const filesGenerated: Record<string, any> = {
      formComponent: path.relative(baseDir, formComponentResult.created[0]),
      formHook: path.relative(baseDir, formHooksResult.hook),
      formTypes: path.relative(baseDir, formHooksResult.types),
      formValidate: path.relative(baseDir, formValidatePath),
      createPage: path.relative(baseDir, formPagesResult.create),
      editPage: path.relative(baseDir, formPagesResult.edit)
    }

    const rollbackFile = saveRollbackContext(rollbackCtx, {
      name: entity.name,
      baseDir: 'list-generator/logs/form',
      metadata: {
        label: entity.label,
        description: `Gerou formulário completo`,
        filesGenerated
      }
    })

    success(`Rollback salvo: ${path.relative(baseDir, rollbackFile)}`)

    console.log('\n✨ Geração de formulário concluída com sucesso!\n')
    console.log('📋 Próximos passos:')
    console.log('   1. Verifique os arquivos gerados')
    console.log('   2. Execute: pnpm lint:fix')
    console.log('   3. Teste a criação/edição\n')
    console.log('💡 Para reverter, execute: pnpm rollback:form\n')
  } catch (error) {
    fail('Erro inesperado durante a geração', error)
  }
}

// Executa o main
main()
