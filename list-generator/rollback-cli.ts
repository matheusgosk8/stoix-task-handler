import path from 'path'
import fs from 'fs-extra'
import prompts from 'prompts'
import { rollbackLatestGeneration, rollbackById, listRollbacks } from './utils/rollback'

// Detecta o tipo baseado nos argumentos (list ou form)
const type = process.argv[2] === 'form' ? 'form' : 'list'
const LOGS_DIR = `list-generator/logs/${type}`

function fail(message: string): never {
  console.error(`❌ ${message}`)
  process.exit(1)
}

function success(message: string) {
  console.log(`✅ ${message}`)
}

/**
 * Lista todos os arquivos de rollback disponíveis
 */
function listRollbackFiles(): string[] {
  const dir = path.resolve(process.cwd(), LOGS_DIR)

  if (!fs.existsSync(dir)) {
    return []
  }

  const files = fs
    .readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .sort()
    .reverse() // Mais recente primeiro

  return files
}

/**
 * Executa rollback do arquivo mais recente
 */
async function executeLatestRollback() {
  const files = listRollbackFiles()

  if (files.length === 0) {
    fail(`Nenhum rollback encontrado em ${LOGS_DIR}/`)
  }

  const latest = files[0]

  console.log('\n⚠️  ATENÇÃO: Esta ação não pode ser desfeita!\n')
  console.log(`📄 Arquivo de rollback: ${latest}`)
  console.log(`📁 Localização: ${LOGS_DIR}/${latest}\n`)

  const response = await prompts({
    type: 'confirm',
    name: 'confirm',
    message: 'Tem certeza que deseja executar o rollback?',
    initial: false
  })

  if (!response.confirm) {
    console.log('❌ Rollback cancelado')
    process.exit(0)
  }

  try {
    console.log('\n⏪ Executando rollback...\n')

    const rollbackFile = rollbackLatestGeneration(LOGS_DIR)

    // Remove o arquivo de rollback após executar
    fs.removeSync(rollbackFile)

    success('Rollback executado com sucesso!')
    console.log('🗑️  Arquivo de rollback removido\n')
  } catch (error) {
    fail(`Erro ao executar rollback: ${error instanceof Error ? error.message : error}`)
  }
}

/**
 * Lista todos os rollbacks disponíveis com detalhes
 */
function listRollbacksDetailed() {
  const rollbacks = listRollbacks(LOGS_DIR)

  if (rollbacks.length === 0) {
    console.log('📭 Nenhum rollback encontrado')
    return
  }

  console.log('\n📋 Rollbacks disponíveis:\n')

  rollbacks.forEach((ctx, index) => {
    const { metadata } = ctx
    const date = new Date(metadata.timestamp)
    const formattedDate = date.toLocaleString('pt-BR')

    console.log(`${index + 1}. [${metadata.id}] ${formattedDate}`)
    console.log(`   📦 ${metadata.label || metadata.entityName}`)
    if (metadata.description) {
      console.log(`   📝 ${metadata.description}`)
    }
    console.log(
      `   📁 Criados: ${ctx.createdFiles.length} | Modificados: ${ctx.modifiedFiles.length} | Dirs: ${ctx.createdDirs.length}`
    )
    console.log('')
  })
}

/**
 * Executa rollback específico por ID
 */
async function executeRollbackById() {
  const rollbacks = listRollbacks(LOGS_DIR)

  if (rollbacks.length === 0) {
    console.log('📭 Nenhum rollback encontrado')
    return
  }

  const choices = rollbacks.map(ctx => {
    const { metadata } = ctx
    const date = new Date(metadata.timestamp)
    const formattedDate = date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    return {
      title: `[${metadata.id}] ${formattedDate} - ${metadata.label || metadata.entityName}`,
      description:
        metadata.description || `${ctx.createdFiles.length} arquivos, ${ctx.modifiedFiles.length} modificados`,
      value: metadata.id
    }
  })

  const response = await prompts({
    type: 'select',
    name: 'id',
    message: 'Selecione o rollback para executar:',
    choices
  })

  if (!response.id) {
    console.log('❌ Operação cancelada')
    return
  }

  console.log('\n⚠️  ATENÇÃO: Esta ação não pode ser desfeita!\n')

  const confirm = await prompts({
    type: 'confirm',
    name: 'confirm',
    message: 'Tem certeza que deseja executar o rollback?',
    initial: false
  })

  if (!confirm.confirm) {
    console.log('❌ Rollback cancelado')
    return
  }

  try {
    console.log('\n⏪ Executando rollback...\n')

    const rollbackFile = rollbackById(response.id, LOGS_DIR)

    // Remove o arquivo de rollback após executar
    fs.removeSync(rollbackFile)

    success('Rollback executado com sucesso!')
    console.log('🗑️  Arquivo de rollback removido\n')
  } catch (error) {
    fail(`Erro ao executar rollback: ${error instanceof Error ? error.message : error}`)
  }
}

/**
 * Limpa todos os arquivos de rollback
 */
async function clearAllRollbacks() {
  const files = listRollbackFiles()

  if (files.length === 0) {
    console.log('📭 Nenhum rollback para limpar')
    return
  }

  console.log(`\n⚠️  Isso vai remover ${files.length} arquivo(s) de rollback\n`)

  const response = await prompts({
    type: 'confirm',
    name: 'confirm',
    message: 'Tem certeza que deseja limpar todos os rollbacks?',
    initial: false
  })

  if (!response.confirm) {
    console.log('❌ Operação cancelada')
    return
  }

  const dir = path.resolve(process.cwd(), LOGS_DIR)

  fs.removeSync(dir)

  success(`${files.length} arquivo(s) de rollback removido(s)`)
}

/**
 * Menu principal
 */
async function main() {
  console.log('\n🔄 Gerenciador de Rollback\n')

  const response = await prompts({
    type: 'select',
    name: 'action',
    message: 'O que você deseja fazer?',
    choices: [
      { title: '⏪ Executar rollback (última geração)', value: 'execute' },
      { title: '📋 Listar rollbacks disponíveis', value: 'list' },
      { title: '🎯 Executar rollback específico por ID', value: 'executeById' },
      { title: '🗑️  Limpar todos os rollbacks', value: 'clear' },
      { title: '❌ Cancelar', value: 'cancel' }
    ],
    initial: 0
  })

  if (!response.action || response.action === 'cancel') {
    console.log('Operação cancelada')
    return
  }

  switch (response.action) {
    case 'execute':
      await executeLatestRollback()
      break
    case 'list':
      listRollbacksDetailed()
      break
    case 'executeById':
      await executeRollbackById()
      break
    case 'clear':
      await clearAllRollbacks()
      break
  }
}

main()
