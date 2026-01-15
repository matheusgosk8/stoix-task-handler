import path from 'path'
import fs from 'fs-extra'
import { randomUUID } from 'crypto'
import type { ListEntityConfig } from '../types/generator-types'
import type { RollbackContext } from '../utils/rollback'
import { getNamingVariations } from '../utils/naming'

/**
 * Gera valor mockado baseado no tipo do field
 */
const studentNames = [
  'LYAN VILELA GOMES',
  'FELIPE ELIAS GOMES DA SILVEIRA',
  'YAN GONTIJO SIQUEIRA',
  'PEDRO GONZAGA DE SOUZA',
  'MARIA JULIA CARVALHO CARDOSO CUNHA',
  'ARTHUR CRISÓSTOMO BASSO DE PAULA',
  'DANIEL FLEURY ARAÚJO',
  'JOÃO DONIZETE GUERRA FILHO',
  'BEATRIZ ALVES ORMONDE DE ALMEIDA',
  'MARIA LAURA FARIA BERNACCHI',
  'ANA LUIZA FARIA BERNACCHI',
  'ANDRESSA ALVES BONIFÁCIO GOMES',
  'IZABELLE GONCALVES XAVIER',
  'SOFIA VIANA GONÇALVES DE MIRANDA'
]

function generateMockValue(fieldName: string, fieldConfig: any, index: number): any {
  // String
  if (fieldConfig.type === 'string') {
    if (fieldName === 'student_name') {
      return studentNames[index % studentNames.length]
    }
    if (fieldName.includes('code') || fieldName.includes('isbn')) {
      return `CODE-${String(index + 1).padStart(4, '0')}`
    }
    if (fieldName.includes('title') || fieldName.includes('name')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} ${index + 1}`
    }
    if (fieldName.includes('description')) {
      return `Descrição do item ${index + 1}`
    }
    if (fieldName.includes('author')) {
      return ['João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Costa', 'Carlos Souza'][index % 5]
    }
    if (fieldName.includes('publisher')) {
      return ['Editora ABC', 'Editora XYZ', 'Editora 123'][index % 3]
    }
    if (fieldName.includes('email')) {
      return `user${index + 1}@example.com`
    }
    if (fieldName.includes('phone')) {
      return `(11) 9${String(1000 + index).padStart(4, '0')}-${String(1000 + index).padStart(4, '0')}`
    }
    if (fieldName.includes('url') || fieldName.includes('link')) {
      return `https://example.com/${fieldName}/${index + 1}`
    }
    if (fieldName.includes('image') || fieldName.includes('photo') || fieldName.includes('picture')) {
      return `/images/placeholders/${fieldName}-${index + 1}.jpg`
    }
    return `${fieldName} ${index + 1}`
  }

  // Number
  if (fieldConfig.type === 'number') {
    if (fieldName.includes('invoice_id') || fieldName.includes('enrollment_id')) {
      // Números de 5 dígitos (10000-99999)
      return Math.floor(Math.random() * 90000) + 10000
    }
    if (fieldName.includes('price') || fieldName.includes('value') || fieldName.includes('cost')) {
      // Valores em centavos entre 3000 e 6000 (R$ 30,00 a R$ 60,00)
      return Math.floor(Math.random() * 3000) + 3000
    }
    if (fieldName.includes('installment_price')) {
      // Valor parcelado em centavos, um pouco maior
      return Math.floor(Math.random() * 4000) + 3500
    }
    if (fieldName.includes('stock') || fieldName.includes('quantity')) {
      return Math.floor(Math.random() * 100) + 1
    }
    if (fieldName.includes('year')) {
      return 2024
    }
    if (fieldName.includes('installment') && !fieldName.includes('price')) {
      return Math.floor(Math.random() * 12) + 1
    }
    return Math.floor(Math.random() * 100) + 1
  }

  // Boolean
  if (fieldConfig.type === 'boolean') {
    return index % 2 === 0
  }

  // Date - retorna objeto Date
  if (fieldConfig.type === 'date') {
    const date = new Date()
    date.setDate(date.getDate() + index)
    return date
  }

  // Enum
  if (fieldConfig.type === 'enum' && fieldConfig.values) {
    return fieldConfig.values[index % fieldConfig.values.length]
  }

  return null
}

/**
 * Gera um objeto mockado baseado nos fields
 */
function generateMockItem(fields: Record<string, any>, index: number): Record<string, any> {
  const item: Record<string, any> = {}

  Object.entries(fields).forEach(([fieldName, fieldConfig]) => {
    // ID - verifica se é string (UUID) ou número
    if (fieldName === 'id') {
      if (fieldConfig.type === 'string') {
        item.id = randomUUID()
      } else {
        item.id = index + 1
      }
      return
    }

    // Campos opcionais: 50% de chance de ter valor
    if (fieldConfig.optional && Math.random() > 0.5) {
      return
    }

    item[fieldName] = generateMockValue(fieldName, fieldConfig, index)
  })

  return item
}

/**
 * Gera o conteúdo do arquivo fake-db
 */
function generateFakeDbContent(
  typeName: string,
  typeImportPath: string,
  fields: Record<string, any>,
  amount: number
): string {
  const items = Array.from({ length: amount }, (_, i) => generateMockItem(fields, i))

  // Formata cada item com indentação
  const itemsFormatted = items
    .map(item => {
      const entries = Object.entries(item).map(([key, value]) => {
        if (typeof value === 'string') {
          return `    ${key}: '${value}'`
        }
        // Se for Date, gera new Date()
        if (value instanceof Date) {
          return `    ${key}: new Date('${value.toISOString()}')`
        }
        return `    ${key}: ${JSON.stringify(value)}`
      })
      return `  {\n${entries.join(',\n')}\n  }`
    })
    .join(',\n')

  return `// Type Imports
import type { ${typeName} } from '${typeImportPath}'

export const db: ${typeName}[] = [
${itemsFormatted}
]
`
}

/**
 * Converte outputPath do type para importPath
 */
function generateTypeImportPath(outputPath: string): string {
  // Remove 'src/' e '.ts', adiciona '@/'
  return '@/' + outputPath.replace('src/', '').replace('.ts', '')
}

/**
 * Escreve o arquivo de fake-db
 */
export function writeFakeDb(entity: ListEntityConfig, baseDir: string, rollbackCtx?: RollbackContext) {
  if (!entity.fakeDb?.enabled) {
    console.log('⏭️  FakeDB desabilitado para esta entity')
    return null
  }

  if (!entity.model) {
    throw new Error('Entity precisa ter um model definido para gerar fake-db')
  }

  const { name: typeName, outputPath, fields } = entity.model
  const { path: fakeDbPath, initialAmount = 5 } = entity.fakeDb

  // Gera o import path do type
  const typeImportPath = generateTypeImportPath(outputPath)

  // Gera o conteúdo do arquivo
  const content = generateFakeDbContent(typeName, typeImportPath, fields, initialAmount)

  // Resolve o caminho absoluto
  const fullPath = path.resolve(baseDir, fakeDbPath)

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

  console.log(`✅ FakeDB gerado: ${fakeDbPath} (${initialAmount} items)`)

  return fullPath
}
