// list-generator/writters/page.writter.ts
import fs from 'fs-extra'
import path from 'path'
import type { ListEntityConfig } from '../types/generator-types'
import { NamingUtils } from '../utils/naming'

/**
 * Gera o conteúdo do arquivo page.tsx (SSR)
 */
export function generatePageFileContent(entity: ListEntityConfig): string {
  const { name, label, description } = entity
  const naming = NamingUtils.generateVariations(name)

  // Nome da função do server action
  const serverActionFn = entity.serverAction?.listFn || `get${naming.pascal}Data`

  // Nome do componente de lista
  const listComponentName = `${naming.pascal}List`

  return `// Data Imports
import type { Metadata } from 'next'

import { ${serverActionFn} } from '@/app/server/actions'
import ${listComponentName} from '@/views/dashboard/components/${naming.kebab}/list'

export const metadata: Metadata = {
  title: '${label}',
  description: '${description || label}'
}

const ${naming.pascal}ListApp = async () => {
  // Vars
  const data = await ${serverActionFn}()

  return <${listComponentName} data={data} />
}

export default ${naming.pascal}ListApp
`
}

/**
 * Gera o conteúdo do arquivo index.tsx (wrapper do ListTable)
 */
export function generateListIndexFileContent(entity: ListEntityConfig): string {
  const { name, model } = entity
  const naming = NamingUtils.generateVariations(name)

  // Tipo do dado
  const dataType = model.name

  // Nome do arquivo de types
  const typesFileName = path.basename(model.outputPath, '.ts')

  // Nome do componente
  const componentName = `${naming.pascal}List`

  return `// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import ListTable from './ListTable'
import type { ${dataType} } from '@/types/dashboard/${typesFileName}'

const ${componentName} = ({ data }: { data: ${dataType}[] }) => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <ListTable tableData={data} />
      </Grid>
    </Grid>
  )
}

export default ${componentName}
`
}

/**
 * Escreve os arquivos page.tsx e list/index.tsx
 */
export async function writePageFiles(entity: ListEntityConfig, projectRoot: string): Promise<{ created: string[] }> {
  const naming = NamingUtils.generateVariations(entity.name)
  const createdFiles: string[] = []

  // 1. Gera page.tsx (SSR) em src/app/(dashboard)/book-products/page.tsx
  const pageDir = path.join(projectRoot, 'src/app/(dashboard)', naming.kebab)
  const pagePath = path.join(pageDir, 'page.tsx')

  await fs.ensureDir(pageDir)
  const pageContent = generatePageFileContent(entity)
  await fs.writeFile(pagePath, pageContent, 'utf-8')
  createdFiles.push(pagePath)
  console.log(`✅ Page gerado: ${pagePath}`)

  // 2. Gera list/index.tsx em src/views/dashboard/components/book-products/list/index.tsx
  const listDir = path.join(projectRoot, 'src/views/dashboard/components', naming.kebab, 'list')
  const listIndexPath = path.join(listDir, 'index.tsx')

  await fs.ensureDir(listDir)
  const listIndexContent = generateListIndexFileContent(entity)
  await fs.writeFile(listIndexPath, listIndexContent, 'utf-8')
  createdFiles.push(listIndexPath)
  console.log(`✅ List Index gerado: ${listIndexPath}`)

  return {
    created: createdFiles
  }
}
