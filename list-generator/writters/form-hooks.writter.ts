import * as fs from 'fs-extra'
import * as path from 'path'
import type { ListEntityConfig } from '../types/generator-types'
import { NamingUtils } from '../utils/naming'

export function generateFormHookContent(entity: ListEntityConfig): string {
  const naming = NamingUtils.generateVariations(entity.name)

  // Get type name from output path
  const typeFileName = path.basename(entity.model.outputPath, '.ts')
  const typeName = naming.pascal + 'Type'

  // Get server action name - usa o configurado no entity ou gera automaticamente
  const getByIdAction = entity.serverAction?.getByIdFn || `get${naming.pascal}ById`

  // Detecta se o id é string ou number
  const idFieldType = entity.model.fields.id?.type || 'string'
  const idConversion = idFieldType === 'number' ? 'Number(params?.id)' : 'params?.id as string'

  // Generate field list for defaultValues
  const defaultValueFields = entity
    .form!.fields.map(field => {
      const fieldConfig = entity.model.fields[field.name]

      if (!fieldConfig) return `  ${field.name}: data?.${field.name} ?? ''`

      switch (fieldConfig.type) {
        case 'number':
          return `  ${field.name}: data?.${field.name} ?? 0`
        case 'boolean':
          return `  ${field.name}: data?.${field.name} ?? false`
        case 'date':
          return `  ${field.name}: data?.${field.name} ?? new Date()`
        default:
          if (field.type === 'radio' || field.type === 'select') {
            const defaultOption = field.options?.[0]?.value ?? ''
            return `  ${field.name}: data?.${field.name} ?? '${defaultOption}'`
          }
          return `  ${field.name}: data?.${field.name} ?? ''`
      }
    })
    .join(',\n')

  return `// hooks/index.hook.ts
import { useCallback, useEffect, useState } from 'react'

import { useParams, useRouter } from 'next/navigation'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'react-toastify'

import { getDefaultValues } from './index.types'
import { schemaValidate } from './index.validate'
import type { ${typeName} } from '@/types/dashboard/${typeFileName}'
import { ${getByIdAction} } from '@/app/server/actions'

export const usePage = () => {
  const params = useParams()
  const router = useRouter()
  const id = ${idConversion}

  const [currentData, setCurrentData] = useState<${typeName} | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    setValue
  } = useForm({
    resolver: zodResolver(schemaValidate),
    defaultValues: getDefaultValues()
  })

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const data = await ${getByIdAction}(id)

      setCurrentData(data)
      reset(getDefaultValues(data))
    } catch (error) {
      toast.error('Erro ao carregar dados')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchData()
    } else {
      setIsLoading(false)
    }
  }, [id])

  const onSubmit = useCallback(
    (data: any) => {
      console.log('Dados enviados:', data)
      
      if (id) {
        toast.success('${entity.label} atualizada com sucesso!')
      } else {
        toast.success('${entity.label} criada com sucesso!')
      }
      
      router.push('/${naming.kebab}')
    },
    [id, router]
  )

  return {
    control,
    handleSubmit,
    errors,
    onSubmit,
    currentData,
    isLoading,
    isEdit: !!id
  }
}
`
}

export function generateFormTypesContent(entity: ListEntityConfig): string {
  const naming = NamingUtils.generateVariations(entity.name)

  // Get type name from output path
  const typeFileName = path.basename(entity.model.outputPath, '.ts')
  const typeName = naming.pascal + 'Type'

  // Generate field list for defaultValues
  const defaultValueFields = entity
    .form!.fields.map(field => {
      const fieldConfig = entity.model.fields[field.name]

      if (!fieldConfig) return `  ${field.name}: data?.${field.name} ?? ''`

      switch (fieldConfig.type) {
        case 'number':
          return `  ${field.name}: data?.${field.name} ?? 0`
        case 'boolean':
          return `  ${field.name}: data?.${field.name} ?? false`
        case 'date':
          return `  ${field.name}: data?.${field.name} ?? new Date()`
        default:
          if (field.type === 'radio' || field.type === 'select') {
            const defaultOption = field.options?.[0]?.value ?? ''
            return `  ${field.name}: data?.${field.name} ?? '${defaultOption}'`
          }
          return `  ${field.name}: data?.${field.name} ?? ''`
      }
    })
    .join(',\n')

  return `import type { ${typeName} } from "@/types/dashboard/${typeFileName}"

export const getDefaultValues = (data?: ${typeName}) => ({
${defaultValueFields}
})
`
}

export async function writeFormHooks(
  entity: ListEntityConfig,
  projectRoot: string
): Promise<{ hook: string; types: string }> {
  const naming = NamingUtils.generateVariations(entity.name)
  const componentPath = path.join(projectRoot, 'src', 'app', '(dashboard)', naming.kebab, 'create', 'hooks')

  // Ensure directory exists
  await fs.ensureDir(componentPath)

  // Write hook file
  const hookPath = path.join(componentPath, 'index.hook.ts')
  const hookContent = generateFormHookContent(entity)
  await fs.writeFile(hookPath, hookContent, 'utf-8')

  // Write types file
  const typesPath = path.join(componentPath, 'index.types.ts')
  const typesContent = generateFormTypesContent(entity)
  await fs.writeFile(typesPath, typesContent, 'utf-8')

  return { hook: hookPath, types: typesPath }
}
