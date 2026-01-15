// list-generator/writters/filters.writter.ts
import fs from 'fs-extra'
import path from 'path'
import type { ListEntityConfig } from '../types/generator-types'
import { NamingUtils } from '../utils/naming'

/**
 * Capitaliza primeira letra
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Gera o conteúdo do arquivo TableFilters.tsx
 */
export function generateFiltersFileContent(entity: ListEntityConfig): string {
  const { name, model, filters } = entity
  const naming = NamingUtils.generateVariations(entity.name)

  // Tipo do dado
  const dataType = model.name

  // Nome do arquivo de types
  const typesFileName = path.basename(model.outputPath, '.ts')

  // Verifica se tem campo status no model
  const hasStatusField = model.fields && ('status' in model.fields || 'isActive' in model.fields)
  const statusField =
    'status' in model.fields ? model.fields.status : 'isActive' in model.fields ? model.fields.isActive : null

  // Se tem enum de status, pega os valores
  const statusValues: string[] = statusField?.type === 'enum' ? statusField.values : ['Active', 'Inactive']

  // Gera os estados baseados nos filtros habilitados
  const states: string[] = []
  const effects: string[] = []
  const filterConditions: string[] = []
  const filterFields: string[] = []
  const imports = new Set<string>(['CustomTextField'])

  if (filters?.search) {
    states.push("  const [globalFilter, setGlobalFilter] = useState('')")
    filterFields.push(`        <Grid item xs={12} sm={8}>
          <CustomTextField
            fullWidth
            label='Buscar'
            placeholder='Buscar...'
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
          />
        </Grid>`)
  }

  if (filters?.status && hasStatusField) {
    states.push("  const [status, setStatus] = useState('')")
    effects.push('status')
    const filterFieldName = 'status' in model.fields ? 'status' : 'isActive'
    filterConditions.push(`    const matchesStatus =
      !status ||
      (status === 'active' && item.${filterFieldName} === true) ||
      (status === 'inactive' && item.${filterFieldName} === false) ||
      (status === 'deleted' && !!item.deletedAt)`)
    filterConditions.push('matchesStatus')

    const statusOptions = [
      { label: 'Ativo', value: 'active' },
      { label: 'Inativo', value: 'inactive' },
      { label: 'Lixeira', value: 'deleted' }
    ]
      .map(opt => `            <MenuItem key=\"${opt.value}\" value=\"${opt.value}\">${opt.label}</MenuItem>`)
      .join('\n')

    filterFields.push(`        <Grid item xs={12} sm={4}>
          <CustomTextField
            select
            fullWidth
            label='Situação'
            value={status}
            onChange={e => setStatus(e.target.value)}
            SelectProps={{ displayEmpty: true }}
          >
            <MenuItem value=\"\">Todos</MenuItem>
${statusOptions}
          </CustomTextField>
        </Grid>`)
  }

  // Filtros customizados
  if (filters?.custom && filters.custom.length > 0) {
    filters.custom.forEach(filter => {
      const stateVar = `${filter.field}Filter`

      if (filter.type === 'dateRange') {
        imports.add('DatePickerRange')
        states.push(
          `  const [${filter.field}StartDate, set${capitalize(filter.field)}StartDate] = useState<Date | null>(null)`
        )
        states.push(
          `  const [${filter.field}EndDate, set${capitalize(filter.field)}EndDate] = useState<Date | null>(null)`
        )
        effects.push(`${filter.field}StartDate`, `${filter.field}EndDate`)

        filterFields.push(`        <Grid item xs={12} sm={6}>
          <DatePickerRange
            label='${filter.label}'
            startDate={${filter.field}StartDate}
            endDate={${filter.field}EndDate}
            id='${filter.field}-date-range-picker'
            onChangeDate={(dates) => {
              if (Array.isArray(dates)) {
                set${capitalize(filter.field)}StartDate(dates[0])
                set${capitalize(filter.field)}EndDate(dates[1])
              }
            }}
          />
        </Grid>`)
      } else {
        // MULTIPLE SELECT
        if (filter.type === 'select' && filter.multiple && Array.isArray(filter.options)) {
          states.push(`  const [${stateVar}, set${capitalize(stateVar)}] = useState<string[]>([])`)
          effects.push(stateVar)
          const options = filter.options
            .map(opt => {
              if (typeof opt === 'string') {
                return `            <MenuItem value="${opt}">${opt}</MenuItem>`
              } else {
                return `            <MenuItem value="${opt.value}">${opt.label}</MenuItem>`
              }
            })
            .join('\n')
          filterFields.push(`        <Grid item xs={12} sm={4}>
          <CustomTextField
            select
            fullWidth
            label='${filter.label}'
            value={${stateVar}}
            onChange={e => set${capitalize(stateVar)}(Array.isArray(e.target.value) ? e.target.value : [e.target.value])}
            SelectProps={{ multiple: true, renderValue: (selected) => (selected as string[]).join(', ') }}
          >
${options}
          </CustomTextField>
        </Grid>`)
          // Lógica de filtro para múltipla seleção
          filterConditions.push(
            `    const matches${capitalize(filter.field)} = !${stateVar}.length || ${stateVar}.includes(item.${filter.field})`
          )
          filterConditions.push(`matches${capitalize(filter.field)}`)
        } else {
          states.push(`  const [${stateVar}, set${capitalize(stateVar)}] = useState('')`)
          effects.push(stateVar)
          if (filter.type === 'select' && filter.options) {
            const options = filter.options
              .map(opt => {
                if (typeof opt === 'string') {
                  return `            <MenuItem value="${opt}">${opt}</MenuItem>`
                } else {
                  return `            <MenuItem value="${opt.value}">${opt.label}</MenuItem>`
                }
              })
              .join('\n')
            filterFields.push(`        <Grid item xs={12} sm={4}>
            <CustomTextField
              select
              fullWidth
              label='${filter.label}'
              value={${stateVar}}
              onChange={e => set${capitalize(stateVar)}(e.target.value)}
              SelectProps={{ displayEmpty: true }}
            >
              <MenuItem value="">Todos</MenuItem>
${options}
            </CustomTextField>
          </Grid>`)
          } else if (filter.type === 'number') {
            filterFields.push(`        <Grid item xs={12} sm={4}>
            <CustomTextField
              fullWidth
              type='number'
              label='${filter.label}'
              value={${stateVar}}
              onChange={e => set${capitalize(stateVar)}(e.target.value)}
            />
          </Grid>`)
          }
        }
      }
    })
  }

  // Se não tem filtros, retorna componente vazio
  if (!filters?.search && !filters?.status) {
    return `// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import CardContent from '@mui/material/CardContent'

// Component Imports
import type { ${dataType} } from '@/types/dashboard/${typesFileName}'

const TableFilters = ({ setData, tableData }: { setData: (data: ${dataType}[]) => void; tableData?: ${dataType}[] }) => {
  useEffect(() => {
    setData(tableData || [])
  }, [tableData, setData])

  return <CardContent>{/* Sem filtros configurados */}</CardContent>
}

export default TableFilters
`
  }

  // Monta o useEffect de filtragem
  const useEffectDeps = ['tableData', 'setData', ...effects].join(', ')
  const filterLogic =
    filterConditions.length > 0
      ? `    const filteredData = tableData?.filter(item => {
${filterConditions.filter(c => c.includes('const')).join('\n')}

      return ${filterConditions.filter(c => !c.includes('const')).join(' && ')}
    })

    setData(filteredData || [])`
      : '    setData(tableData || [])'

  // Gera imports customizados
  const importDatePicker = imports.has('DatePickerRange')
    ? "import DatePickerRange from '@/components/DatePickerRange'"
    : ''

  const collapsible = filters?.collapsible || false

  // Se for collapsible, adiciona imports necessários
  const collapseImports = collapsible
    ? `import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import CardActions from '@mui/material/CardActions'
import Typography from '@mui/material/Typography'`
    : ''

  // Se for collapsible, adiciona estado de expansão
  const expandedState = collapsible ? '  const [expanded, setExpanded] = useState(false)\n' : ''

  // Adiciona botão de buscar se for collapse ou mais de 3 filtros
  let buscarButton = ''
  if (collapsible || filterFields.length > 3) {
    buscarButton = `\n          <div className='flex justify-end'>\n            <Button variant='contained' startIcon={<i className=\"tabler-search\" />} className='max-sm:is-full'>\n              Buscar\n            </Button>\n          </div>`
  }

  // Se for collapsible, envolve os filtros no Collapse
  const contentWrapper = collapsible
    ? `  return (\n    <>\n      <CardActions className='justify-between card-actions-dense'>\n        <Button variant='tonal' onClick={() => setExpanded(!expanded)}>\n          <Typography variant='h5'>Filtros</Typography>\n        </Button>\n        <IconButton onClick={() => setExpanded(!expanded)}>\n          <i className={expanded ? 'tabler-chevron-up' : 'tabler-chevron-down'} />\n        </IconButton>\n      </CardActions>\n      <Collapse in={expanded} timeout={300}>\n        <Divider />\n        <CardContent>\n          <Grid container spacing={6}>\n${filterFields.join('\n')}\n          </Grid>${buscarButton}\n        </CardContent>\n      </Collapse>\n    </>\n  )`
    : `  return (\n    <CardContent>\n      <Grid container spacing={6}>\n${filterFields.join('\n')}\n      </Grid>${buscarButton}\n    </CardContent>\n  )`

  return `// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
${collapseImports}

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
${importDatePicker}
import type { ${dataType} } from '@/types/dashboard/${typesFileName}'

const TableFilters = ({ setData, tableData }: { setData: (data: ${dataType}[]) => void; tableData?: ${dataType}[] }) => {
${expandedState}${states.join('\n')}

  useEffect(() => {
${filterLogic}
  }, [${useEffectDeps}])

${contentWrapper}
}

export default TableFilters
`
}

/**
 * Escreve o arquivo TableFilters.tsx
 */
export async function writeFilters(entity: ListEntityConfig, projectRoot: string): Promise<{ created: string[] }> {
  const naming = NamingUtils.generateVariations(entity.name)

  // Caminho: src/views/dashboard/components/book-products/list/TableFilters.tsx
  const listDir = path.join(projectRoot, 'src/views/dashboard/components', naming.kebab, 'list')
  const filtersPath = path.join(listDir, 'TableFilters.tsx')

  // Cria diretório se não existir
  await fs.ensureDir(listDir)

  // Gera conteúdo
  const content = generateFiltersFileContent(entity)

  // Escreve arquivo
  await fs.writeFile(filtersPath, content, 'utf-8')

  console.log(`✅ Filters gerado: ${filtersPath}`)

  return {
    created: [filtersPath]
  }
}
