import path from 'path'

import fs from 'fs-extra'

import type { ListEntityConfig } from '../types/generator-types'
import type { RollbackContext } from '../utils/rollback'
import { getNamingVariations } from '../utils/naming'

/**
 * Mapeia o tipo do field para TypeScript type
 */
function mapFieldType(field: any): string {
  if (field.type === 'string') return 'string'
  if (field.type === 'number') return 'number'
  if (field.type === 'boolean') return 'boolean'
  if (field.type === 'date') return 'Date'

  if (field.type === 'enum') {
    if (field.values && Array.isArray(field.values)) {
      return field.values.map((v: string) => `'${v}'`).join(' | ')
    }

    return 'string'
  }

  return 'any'
}

/**
 * Constrói o corpo do type com base nos fields do model
 */
function buildTypeBody(fields: Record<string, any>): string {
  const lines = Object.entries(fields).map(([fieldName, fieldConfig]) => {
    const isOptional = fieldConfig.optional ? '?' : ''
    const fieldType = mapFieldType(fieldConfig)

    return `  ${fieldName}${isOptional}: ${fieldType}`
  })

  return lines.join('\n')
}

/**
 * Gera o conteúdo completo do arquivo de types
 */
function generateTypesFileContent(typeName: string, fields: Record<string, any>): string {
  const body = buildTypeBody(fields)

  return `// Type Imports

export type ${typeName} = {
${body}
}
`
}

/**
 * Escreve o arquivo de types no filesystem
 */
export function writeTypes(entity: ListEntityConfig, baseDir: string, rollbackCtx?: RollbackContext) {
  if (!entity.model) {
    throw new Error('Entity precisa ter um model definido para gerar types')
  }

  const { name: typeName, outputPath, fields } = entity.model

  // Gera o conteúdo do arquivo
  const content = generateTypesFileContent(typeName, fields)

  // Resolve o caminho absoluto
  const fullPath = path.resolve(baseDir, outputPath)

  // Salva snapshot para rollback se necessário
  if (rollbackCtx && fs.existsSync(fullPath)) {
    const originalContent = fs.readFileSync(fullPath, 'utf-8')

    rollbackCtx.modifiedFiles.push({
      path: fullPath,
      content: originalContent
    })
  }

  // Cria o diretório se não existir
  const dir = path.dirname(fullPath)

  if (!fs.existsSync(dir)) {
    fs.ensureDirSync(dir)

    if (rollbackCtx) {
      rollbackCtx.createdDirs.push(dir)
    }
  }

  // Escreve o arquivo
  fs.writeFileSync(fullPath, content, 'utf-8')

  // Registra arquivo criado para rollback
  if (rollbackCtx && !rollbackCtx.modifiedFiles.some(f => f.path === fullPath)) {
    rollbackCtx.createdFiles.push(fullPath)
  }

  console.log(`✅ Types gerado: ${outputPath}`)

  return fullPath
}
