// list-generator/writters/columns.writter.ts
import fs from 'fs-extra'
import path from 'path'
import type { ListEntityConfig, EntityColumnConfig } from '../types/generator-types'
import { NamingUtils } from '../utils/naming'

/**
 * Gera o conteúdo do arquivo columns.config.tsx
 */
export function generateColumnsFileContent(entity: ListEntityConfig): string {
  const { name, model, table, columns } = entity
  const naming = NamingUtils.generateVariations(name)

  // Tipo do dado (ex: BookProductType)
  const dataType = model.name
  const dataTypeWithAction = `${dataType}WithAction`

  // Nome do arquivo de types (ex: bookProductTypes) - extrai do outputPath
  const typesFileName = path.basename(model.outputPath, '.ts')

  // Imports necessários
  const imports = generateImports(entity)

  // Gera as colunas
  const columnsCode = generateColumnsArray(entity)

  return `import Link from 'next/link'

import { createColumnHelper } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
${imports}

import type { ${dataType} } from '@/types/dashboard/${typesFileName}'

type ${dataTypeWithAction} = ${dataType} & { action?: string }

const columnHelper = createColumnHelper<${dataTypeWithAction}>()

export const createColumns = (
  data: ${dataType}[],
  setData: (data: ${dataType}[]) => void
): ColumnDef<${dataTypeWithAction}, any>[] => [
${columnsCode}
]
`
}

/**
 * Gera os imports necessários baseado nas colunas
 */
function generateImports(entity: ListEntityConfig): string {
  const { columns, table } = entity
  const imports = new Set<string>()

  // Checkbox se tiver seleção
  if (table?.selectable) {
    imports.add('Checkbox')
  }

  // Verifica cada tipo de coluna
  columns.forEach(col => {
    switch (col.type) {
      case 'image':
        // Image pode precisar de CustomAvatar ou Avatar
        break
      case 'toggle':
        imports.add('Switch')
        break
      case 'chip':
        imports.add('Chip')
        break
      case 'actions':
        imports.add('IconButton')
        imports.add('Typography')
        break
      case 'text':
      case 'currency':
      case 'date':
        imports.add('Typography')
        break
    }
  })

  const muiImports = Array.from(imports).join(', ')
  return `import { ${muiImports} } from '@mui/material'`
}

/**
 * Gera o array de colunas
 */
function generateColumnsArray(entity: ListEntityConfig): string {
  const { columns, table } = entity
  const columnCodes: string[] = []

  // 1. Coluna de checkbox (se habilitado)
  if (table?.selectable) {
    columnCodes.push(generateCheckboxColumn())
  }

  // 2. Colunas configuradas
  columns.forEach(col => {
    if (!col.show) return

    switch (col.type) {
      case 'text':
        columnCodes.push(generateTextColumn(col))
        break
      case 'currency':
        columnCodes.push(generateCurrencyColumn(col))
        break
      case 'date':
        columnCodes.push(generateDateColumn(col))
        break
      case 'chip':
        columnCodes.push(generateChipColumn(col))
        break
      case 'image':
        columnCodes.push(generateImageColumn(col))
        break
      case 'toggle':
        columnCodes.push(generateToggleColumn(col))
        break
      case 'actions':
        columnCodes.push(generateActionsColumn(col, entity))
        break
    }
  })

  return columnCodes.map(code => `  ${code}`).join(',\n')
}

/**
 * Gera coluna de checkbox
 */
function generateCheckboxColumn(): string {
  return `{
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        {...{
          checked: table.getIsAllRowsSelected(),
          indeterminate: table.getIsSomeRowsSelected(),
          onChange: table.getToggleAllRowsSelectedHandler()
        }}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        {...{
          checked: row.getIsSelected(),
          disabled: !row.getCanSelect(),
          indeterminate: row.getIsSomeSelected(),
          onChange: row.getToggleSelectedHandler()
        }}
      />
    )
  }`
}

/**
 * Gera coluna de texto
 */
function generateTextColumn(col: any): string {
  const { field, header, truncate } = col

  const truncateClass = truncate ? " className='max-is-[200px] truncate'" : ''

  return `columnHelper.accessor('${field}', {
    header: '${header}',
    cell: ({ row }) => <Typography color='text.primary'${truncateClass}>{row.original.${field}}</Typography>
  })`
}

/**
 * Gera coluna de moeda (currency)
 */
function generateCurrencyColumn(col: any): string {
  const { field, header } = col

  return `columnHelper.accessor('${field}', {
    header: '${header}',
    cell: ({ row }) => (
      <Typography color='text.primary'>
        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(row.original.${field} / 100)}
      </Typography>
    )
  })`
}

/**
 * Gera coluna de data
 */
function generateDateColumn(col: any): string {
  const { field, header, format = 'dd/MM/yyyy' } = col

  return `columnHelper.accessor('${field}', {
    header: '${header}',
    cell: ({ row }) => (
      <Typography color='text.primary'>
        {row.original.${field} ? new Date(row.original.${field}).toLocaleDateString('pt-BR') : '-'}
      </Typography>
    )
  })`
}

/**
 * Gera coluna de chip (status colorido)
 */
function generateChipColumn(col: any): string {
  const { field, header, chipColors = {}, chipLabels = {}, variant = 'filled' } = col

  // Gera o mapeamento de cores
  const colorMapping = Object.entries(chipColors)
    .map(([key, color]) => `'${key}': '${color}'`)
    .join(', ')

  // Gera o mapeamento de labels
  const labelMapping = Object.entries(chipLabels)
    .map(([key, label]) => `'${key}': '${label}'`)
    .join(', ')

  return `columnHelper.accessor('${field}', {
    header: '${header}',
    cell: ({ row }) => {
      const colorMap: Record<string, any> = { ${colorMapping} }
      const labelMap: Record<string, string> = { ${labelMapping} }
      const value = row.original.${field}
      
      return (
        <Chip
          label={labelMap[value] || value}
          color={colorMap[value] || 'default'}
          variant='${variant}'
          size='small'
        />
      )
    }
  })`
}

/**
 * Gera coluna de imagem
 */
function generateImageColumn(col: any): string {
  const { field, header, fallback } = col
  const fallbackPath = fallback || '/images/placeholders/no-image.png'

  return `columnHelper.accessor('${field}', {
    header: '${header}',
    cell: ({ row }) => (
      <img 
        src={row.original.${field} || '${fallbackPath}'} 
        alt='${header}' 
        className='w-[40px] h-[40px] object-cover rounded'
      />
    )
  })`
}

/**
 * Gera coluna de toggle (Switch)
 */
function generateToggleColumn(col: any): string {
  const { field, header } = col
  return `columnHelper.accessor('${field}', {
    header: '${header}',
    cell: ({ row }) => (
      <Switch
        checked={!!row.original.${field}}
        onChange={e => {
          if (row.original.set${field.charAt(0).toUpperCase() + field.slice(1)}) {
            row.original.set${field.charAt(0).toUpperCase() + field.slice(1)}(e.target.checked)
          }
        }}
      />
    )
  })`
}

/**
 * Gera coluna de ações
 */
function generateActionsColumn(col: any, entity: ListEntityConfig): string {
  const { actions } = col
  const naming = NamingUtils.generateVariations(entity.name)
  const editRoute = `/${naming.kebab}`

  const actionsButtons: string[] = []

  // Botão de editar
  if (actions.edit) {
    actionsButtons.push(`        <IconButton>
          <Link href={\`${editRoute}/\${row.original.id}/edit\`}>
            <i className='tabler-edit text-textSecondary' />
          </Link>
        </IconButton>`)
  }

  // Botão de deletar
  if (actions.delete) {
    actionsButtons.push(`        <IconButton onClick={() => setData(data.filter(item => item.id !== row.original.id))}>
          <i className='tabler-trash text-textSecondary' />
        </IconButton>`)
  }

  // TODO: Menu de opções (quando actions.menu.enabled === true)
  // if (actions.menu?.enabled) {
  //   // Renderizar OptionMenu com as opções
  // }

  return `columnHelper.accessor('action', {
    header: 'Ações',
    cell: ({ row }) => (
      <Typography color='text.primary' align='center'>
${actionsButtons.join('\n')}
      </Typography>
    ),
    enableSorting: false
  })`
}

/**
 * Escreve o arquivo columns.config.tsx
 */
export async function writeColumns(entity: ListEntityConfig, projectRoot: string): Promise<{ created: string[] }> {
  const naming = NamingUtils.generateVariations(entity.name)

  // Caminho: src/app/(dashboard)/book-products/hooks/columns.config.tsx
  const hooksDir = path.join(projectRoot, 'src/app/(dashboard)', naming.kebab, 'hooks')
  const columnsPath = path.join(hooksDir, 'columns.config.tsx')

  // Cria diretório se não existir
  await fs.ensureDir(hooksDir)

  // Gera conteúdo
  const content = generateColumnsFileContent(entity)

  // Escreve arquivo
  await fs.writeFile(columnsPath, content, 'utf-8')

  console.log(`✅ Columns gerado: ${columnsPath}`)

  return {
    created: [columnsPath]
  }
}
