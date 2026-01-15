import * as fs from 'fs-extra'
import * as path from 'path'
import type { ListEntityConfig } from '../types/generator-types'
import { NamingUtils } from '../utils/naming'

function generateZodValidation(field: any): string {
  const fieldConfig = field
  let validation = ''

  switch (fieldConfig.type) {
    case 'number':
      // Se for currency, usa preprocess com currencyToNumber
      if (fieldConfig.currency) {
        validation = 'z.preprocess(currencyToNumber, z.number()'
      } else {
        validation = 'z.coerce.number()'
      }

      if (fieldConfig.validation?.min !== undefined) {
        validation += `.min(${fieldConfig.validation.min}, '${fieldConfig.validation.message || `Valor mínimo é ${fieldConfig.validation.min}`}')`
      }
      if (fieldConfig.validation?.max !== undefined) {
        validation += `.max(${fieldConfig.validation.max}, '${fieldConfig.validation.message || `Valor máximo é ${fieldConfig.validation.max}`}')`
      }

      // Fecha o preprocess se for currency
      if (fieldConfig.currency) {
        validation += ')'
      }
      break

    case 'text':
    case 'textarea':
    case 'radio':
    case 'select':
      validation = 'z.string()'
      if (fieldConfig.required) {
        validation += `.min(1, '${fieldConfig.validation?.message || `${fieldConfig.label} é obrigatório`}')`
      }
      if (fieldConfig.validation?.min !== undefined) {
        validation += `.min(${fieldConfig.validation.min}, '${fieldConfig.validation.message || `Mínimo de ${fieldConfig.validation.min} caracteres`}')`
      }
      if (fieldConfig.validation?.max !== undefined) {
        validation += `.max(${fieldConfig.validation.max}, '${fieldConfig.validation.message || `Máximo de ${fieldConfig.validation.max} caracteres`}')`
      }
      break

    case 'date':
      validation = 'z.date()'
      break

    default:
      validation = 'z.string()'
  }

  // Handle optional fields
  if (!fieldConfig.required && fieldConfig.type !== 'number') {
    validation += '.optional()'
  }

  return validation
}

export function generateFormValidateContent(entity: ListEntityConfig): string {
  // Verifica se tem campos currency
  const hasCurrencyField = entity.form!.fields.some(f => f.type === 'number' && f.currency)

  const validations = entity
    .form!.fields.map(field => {
      const zodRule = generateZodValidation(field)
      return `  ${field.name}: ${zodRule}`
    })
    .join(',\n')

  // Se tem currency, adiciona o helper
  const currencyHelper = hasCurrencyField
    ? `
// Helper para converter strings de currency para number
const currencyToNumber = (val: unknown) => {
  if (typeof val === 'number') return val
  if (typeof val === 'string') {
    // Remove pontos (separador de milhares) e substitui vírgula por ponto
    const cleaned = val.replace(/\\./g, '').replace(',', '.')
    const num = parseFloat(cleaned)
    return isNaN(num) ? 0 : num
  }
  return 0
}
`
    : ''

  return `import { z } from 'zod'
${currencyHelper}
export const schemaValidate = z.object({
${validations}
})
`
}

export async function writeFormValidate(entity: ListEntityConfig, projectRoot: string): Promise<string> {
  const naming = NamingUtils.generateVariations(entity.name)
  const hooksPath = path.join(projectRoot, 'src', 'app', '(dashboard)', naming.kebab, 'create', 'hooks')

  // Ensure directory exists
  await fs.ensureDir(hooksPath)

  // Write validate file
  const validatePath = path.join(hooksPath, 'index.validate.ts')
  const validateContent = generateFormValidateContent(entity)
  await fs.writeFile(validatePath, validateContent, 'utf-8')

  return validatePath
}
