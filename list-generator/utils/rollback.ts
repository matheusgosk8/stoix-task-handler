import path from 'path'

import fs from 'fs-extra'

export type FileSnapshot = {
  path: string
  content: string
}

export type RollbackMetadata = {
  id: string
  timestamp: string
  entityName: string
  label?: string
  description?: string
  filesGenerated?: Record<string, any>
}

export type RollbackContext = {
  createdFiles: string[]
  modifiedFiles: FileSnapshot[]
  createdDirs: string[]
}

export type RollbackContextWithMetadata = RollbackContext & {
  metadata: RollbackMetadata
}

export function createRollbackContext(): RollbackContext {
  return {
    createdFiles: [],
    modifiedFiles: [],
    createdDirs: []
  }
}

const DEFAULT_GENERATIONS_DIR = 'generations'

export function rollback(ctx: RollbackContext) {
  console.warn('⏪ Executando rollback...')

  // 1️⃣ restaura arquivos modificados
  for (const file of ctx.modifiedFiles.reverse()) {
    fs.writeFileSync(file.path, file.content)
    console.warn(`Arquivo restaurado: ${file.path}`)
  }

  // 2️⃣ remove arquivos criados
  for (const file of ctx.createdFiles.reverse()) {
    if (fs.existsSync(file)) {
      fs.removeSync(file)
      console.warn(`Arquivo removido: ${file}`)
    }
  }

  for (const dir of ctx.createdDirs.reverse()) {
    if (fs.existsSync(dir)) {
      fs.removeSync(dir)
      console.warn(`Diretório removido: ${dir}`)
    }
  }
}

type SaveRollbackOptions = {
  name?: string
  baseDir?: string
  metadata?: Partial<RollbackMetadata>
}

export function saveRollbackContext(ctx: RollbackContext, options: SaveRollbackOptions = {}) {
  const baseDir = options.baseDir ?? 'generations'

  const now = new Date()
  const timestamp = now.toISOString()
  const id = now.getTime().toString()

  const fileName = options.name ? `${id}-${options.name}.json` : `${id}.json`

  const dir = path.resolve(process.cwd(), baseDir)

  fs.ensureDirSync(dir)

  const filePath = path.join(dir, fileName)

  // Cria contexto com metadata
  const contextWithMetadata: RollbackContextWithMetadata = {
    ...ctx,
    metadata: {
      id,
      timestamp,
      entityName: options.name || 'unknown',
      label: options.metadata?.label,
      description: options.metadata?.description,
      filesGenerated: options.metadata?.filesGenerated
    }
  }

  fs.writeJsonSync(filePath, contextWithMetadata, { spaces: 2 })

  console.log(`💾 Rollback salvo em: ${filePath}`)

  return filePath
}

export function autoRollbackIfExists(baseDir: string = DEFAULT_GENERATIONS_DIR) {
  const dir = path.resolve(process.cwd(), baseDir)

  if (!fs.existsSync(dir)) {
    return false
  }

  const files = fs
    .readdirSync(dir)
    .filter((f: string) => f.endsWith('.json'))
    .sort() // ISO timestamp → ordem cronológica

  if (files.length === 0) {
    return false
  }

  const latest = files[files.length - 1]
  const filePath = path.join(dir, latest)

  console.warn(`⚠️ Rollback detectado: ${latest}`)

  const ctx = fs.readJsonSync(filePath) as RollbackContext

  rollback(ctx)

  // Remove o arquivo após aplicar o rollback
  fs.removeSync(filePath)
  console.warn(`🗑️ Arquivo de rollback removido: ${latest}`)

  return true
}

export function rollbackLatestGeneration(baseDir: string = DEFAULT_GENERATIONS_DIR) {
  const dir = path.resolve(process.cwd(), baseDir)

  if (!fs.existsSync(dir)) {
    throw new Error('Nenhuma pasta de gerações encontrada')
  }

  const files = fs
    .readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .sort()

  if (files.length === 0) {
    throw new Error('Nenhum rollback encontrado')
  }

  const latest = files[files.length - 1]
  const filePath = path.join(dir, latest)

  console.warn(`⏪ Executando rollback manual: ${latest}`)

  const ctx = fs.readJsonSync(filePath) as RollbackContextWithMetadata

  rollback(ctx)

  return filePath
}

export function rollbackById(id: string, baseDir: string = DEFAULT_GENERATIONS_DIR) {
  const dir = path.resolve(process.cwd(), baseDir)

  if (!fs.existsSync(dir)) {
    throw new Error('Nenhuma pasta de gerações encontrada')
  }

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json') && f.startsWith(id))

  if (files.length === 0) {
    throw new Error(`Rollback com ID ${id} não encontrado`)
  }

  const filePath = path.join(dir, files[0])

  console.warn(`⏪ Executando rollback: ${files[0]}`)

  const ctx = fs.readJsonSync(filePath) as RollbackContextWithMetadata

  if (ctx.metadata) {
    console.warn(`📄 Entity: ${ctx.metadata.label || ctx.metadata.entityName}`)
  }

  rollback(ctx)

  return filePath
}

export function listRollbacks(baseDir: string = DEFAULT_GENERATIONS_DIR): RollbackContextWithMetadata[] {
  const dir = path.resolve(process.cwd(), baseDir)

  if (!fs.existsSync(dir)) {
    return []
  }

  const files = fs
    .readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .sort()
    .reverse()

  return files.map(file => {
    const filePath = path.join(dir, file)
    return fs.readJsonSync(filePath) as RollbackContextWithMetadata
  })
}
