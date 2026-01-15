import path from 'path'
import fs from 'fs-extra'
import prompts from 'prompts'
import { rollbackLatestGeneration } from './utils/rollback'

const LOGS_DIR = 'list-generator/logs'

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
    fail('Nenhum rollback encontrado em list-generator/logs/')
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
 * Lista todos os rollbacks disponíveis
 */
function listRollbacks() {
  const files = listRollbackFiles()

  if (files.length === 0) {
    console.log('📭 Nenhum rollback encontrado')
    return
  }

  console.log('\n📋 Rollbacks disponíveis:\n')

  files.forEach((file, index) => {
    const filePath = path.join(LOGS_DIR, file)
    const ctx = fs.readJsonSync(filePath)

    console.log(`${index + 1}. ${file}`)
    console.log(`   📁 Arquivos criados: ${ctx.createdFiles?.length || 0}`)
    console.log(`   📝 Arquivos modificados: ${ctx.modifiedFiles?.length || 0}`)
    console.log(`   📂 Diretórios criados: ${ctx.createdDirs?.length || 0}`)
    console.log('')
  })
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
      listRollbacks()
      break
    case 'clear':
      await clearAllRollbacks()
      break
  }
}

main()
