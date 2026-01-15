// list-generator/writters/form-component.writter.ts
import fs from 'fs-extra'
import path from 'path'
import type { ListEntityConfig, FormFieldConfig } from '../types/generator-types'
import { NamingUtils } from '../utils/naming'

/**
 * Gera campo do formulário baseado no tipo
 */
function generateFormField(field: FormFieldConfig, naming: any): string {
  const gridProps = field.grid
    ? `xs={${field.grid.xs || 12}} sm={${field.grid.sm || 12}}${field.grid.md ? ` md={${field.grid.md}}` : ''}`
    : 'xs={12}'

  switch (field.type) {
    case 'text':
    case 'textarea':
      return `                    <Grid item ${gridProps}>
                      <Controller
                        name='${field.name}'
                        control={page.control}
                        render={({ field }) => (
                          <CustomTextField
                            {...field}
                            fullWidth
                            ${field.type === 'textarea' ? 'multiline\n                            rows={4}' : ''}
                            label='${field.label}'
                            placeholder='${field.placeholder || ''}'
                            error={!!page.errors.${field.name}}
                            helperText={page.errors.${field.name}?.message}
                          />
                        )}
                      />
                    </Grid>`

    case 'number':
      // Se for currency, usa CurrencyInput
      if (field.currency) {
        return `                    <Grid item ${gridProps}>
                      <Controller
                        name='${field.name}'
                        control={page.control}
                        render={({ field }) => (
                          <CustomTextField
                            {...field}
                            value={field.value ? String(field.value) : ''}
                            fullWidth
                            label='${field.label}'
                            placeholder='${field.placeholder || '0,00'}'
                            error={!!page.errors.${field.name}}
                            helperText={page.errors.${field.name}?.message}
                            InputProps={{
                              startAdornment: <InputAdornment position='start'>R$</InputAdornment>,
                              inputComponent: CurrencyInput
                            }}
                          />
                        )}
                      />
                    </Grid>`
      }

      // Número normal
      return `                    <Grid item ${gridProps}>
                      <Controller
                        name='${field.name}'
                        control={page.control}
                        render={({ field }) => (
                          <CustomTextField
                            {...field}
                            fullWidth
                            type='number'
                            label='${field.label}'
                            placeholder='${field.placeholder || ''}'
                            error={!!page.errors.${field.name}}
                            helperText={page.errors.${field.name}?.message}
                          />
                        )}
                      />
                    </Grid>`

    case 'radio':
      const radioOptions = field.options || []
      return `                    <Grid item ${gridProps} className='flex justify-end'>
                      <FormControl error={Boolean(page.errors.${field.name})}>
                        <FormLabel>${field.label}</FormLabel>
                        <Controller
                          name='${field.name}'
                          control={page.control}
                          rules={{ required: ${field.required || false} }}
                          render={({ field }) => (
                            <RadioGroup row {...field} name='${field.name}'>
${radioOptions
  .map(
    opt => `                              <FormControlLabel
                                value='${opt.value}'
                                control={<Radio checked={field.value === '${opt.value}'} />}
                                label='${opt.label}'
                              />`
  )
  .join('\n')}
                            </RadioGroup>
                          )}
                        />
                      </FormControl>
                    </Grid>`

    case 'select':
      const selectOptions = field.options || []
      return `                    <Grid item ${gridProps}>
                      <Controller
                        name='${field.name}'
                        control={page.control}
                        render={({ field }) => (
                          <CustomTextField
                            {...field}
                            select
                            fullWidth
                            label='${field.label}'
                            error={!!page.errors.${field.name}}
                            helperText={page.errors.${field.name}?.message}
                          >
${selectOptions.map(opt => `                            <MenuItem value='${opt.value}'>${opt.label}</MenuItem>`).join('\n')}
                          </CustomTextField>
                        )}
                      />
                    </Grid>`

    default:
      return `                    <Grid item ${gridProps}>
                      {/* Campo ${field.name} - tipo ${field.type} não implementado */}
                    </Grid>`
  }
}

/**
 * Gera o conteúdo do componente form/index.tsx
 */
export function generateFormComponentContent(entity: ListEntityConfig): string {
  const { name, label, form } = entity
  const naming = NamingUtils.generateVariations(name)

  if (!form || !form.fields || form.fields.length === 0) {
    throw new Error(`Entity ${name} não tem configuração de formulário`)
  }

  const sections = form.sections || [{ title: 'Dados', fields: form.fields.map(f => f.name) }]

  // Verifica se tem algum campo currency para adicionar imports necessários
  const hasCurrencyField = form.fields.some(f => f.type === 'number' && f.currency)

  // Gera as sections com os campos
  const sectionsCode = sections
    .map(section => {
      const fieldNames = section.fields
      const fields = fieldNames.map(name => form.fields.find(f => f.name === name)).filter(Boolean) as FormFieldConfig[]

      // Verifica se tem campo status/radio na seção
      const statusFieldIndex = fields.findIndex(f => f.type === 'radio' && (f.name === 'status' || f.name === 'active'))
      const hasStatusField = statusFieldIndex !== -1
      const firstFieldIndex = 0

      let sectionFields = ''

      // Se tem status, coloca junto com o primeiro campo
      if (hasStatusField && statusFieldIndex !== firstFieldIndex) {
        const firstField = fields[firstFieldIndex]
        const statusField = fields[statusFieldIndex]

        // Primeiro campo com sm=10
        const firstFieldWithAdjustedGrid = { ...firstField, grid: { xs: 12, sm: 10 } }
        sectionFields += generateFormField(firstFieldWithAdjustedGrid, naming) + '\n'

        // Status com sm=2
        const radioOptions = statusField.options || []
        sectionFields += `                    <Grid item xs={12} sm={2} className='flex sm:justify-end'>
                      <FormControl error={Boolean(page.errors.${statusField.name})}>
                        <FormLabel>${statusField.label}</FormLabel>
                        <Controller
                          name='${statusField.name}'
                          control={page.control}
                          rules={{ required: ${statusField.required || false} }}
                          render={({ field }) => (
                            <RadioGroup row {...field} name='${statusField.name}'>
${radioOptions
  .map(
    opt => `                              <FormControlLabel
                                value='${opt.value}'
                                control={<Radio checked={field.value === '${opt.value}'} />}
                                label='${opt.label}'
                              />`
  )
  .join('\n')}
                            </RadioGroup>
                          )}
                        />
                      </FormControl>
                    </Grid>\n`

        // Demais campos (pulando primeiro e status)
        fields.forEach((field, idx) => {
          if (idx !== firstFieldIndex && idx !== statusFieldIndex) {
            sectionFields += generateFormField(field, naming) + '\n'
          }
        })
      } else {
        // Sem status, renderiza normalmente
        sectionFields = fields.map(field => generateFormField(field, naming)).join('\n')
      }

      return `            <Grid item xs={12}>
              <Card>
                <CardHeader title='${section.title}' />
                <CardContent>
                  <Grid container spacing={6} className='mbe-6'>
${sectionFields}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>`
    })
    .join('\n')

  return `'use client'

import { useRouter } from 'next/navigation'

import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Radio,
  FormControlLabel,
  RadioGroup,
  FormControl,
  FormLabel,
  MenuItem${hasCurrencyField ? ',\n  InputAdornment' : ''}
} from '@mui/material'
import { Controller } from 'react-hook-form'

import FormHeader from '@/components/FormHeader'
import CustomTextField from '@/@core/components/mui/TextField'
import { usePage } from '@/app/(dashboard)/${naming.kebab}/create/hooks/index.hook'${hasCurrencyField ? `\nimport CurrencyInput from '../../financial-products/form/CurrencyInput'` : ''}

const Form = () => {
  const page = usePage()
  const router = useRouter()
  const isEdit = !!page.currentData?.id

  return (
    <form onSubmit={page.handleSubmit(page.onSubmit)} className='flex flex-col'>
      <FormHeader
        headerValues={{
          title: isEdit ? 'Editar ${label}' : 'Criar ${label}',
          description: isEdit ? 'Edite as informações' : 'Cadastre um novo registro',
          buttons: {
            back: { title: 'Voltar', action: () => router.push('/${naming.kebab}') },
            save: { title: 'Salvar', action: page.handleSubmit(page.onSubmit) }
          }
        }}
      />

      <Grid container spacing={6}>
        <Grid item xs={12} md={12}>
          <Grid container spacing={6}>
${sectionsCode}
          </Grid>
        </Grid>
      </Grid>
    </form>
  )
}

export default Form
`
}

/**
 * Escreve o arquivo form/index.tsx
 */
export async function writeFormComponent(
  entity: ListEntityConfig,
  projectRoot: string
): Promise<{ created: string[] }> {
  const naming = NamingUtils.generateVariations(entity.name)

  // Caminho: src/views/dashboard/components/book-products/form/index.tsx
  const formDir = path.join(projectRoot, 'src/views/dashboard/components', naming.kebab, 'form')
  const formPath = path.join(formDir, 'index.tsx')

  await fs.ensureDir(formDir)

  const content = generateFormComponentContent(entity)
  await fs.writeFile(formPath, content, 'utf-8')

  console.log(`✅ Form Component gerado: ${formPath}`)

  return {
    created: [formPath]
  }
}
