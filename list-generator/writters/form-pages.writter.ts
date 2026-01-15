import * as fs from 'fs-extra'
import * as path from 'path'
import type { ListEntityConfig } from '../types/generator-types'
import { NamingUtils } from '../utils/naming'

export function generateCreatePageContent(entity: ListEntityConfig): string {
  const naming = NamingUtils.generateVariations(entity.name)

  return `// Next Imports
import type { Metadata } from 'next'

// Component Imports
import Form from '@/views/dashboard/components/${naming.kebab}/form/index'

export const metadata: Metadata = {
  title: 'Cadastro de ${entity.label}',
  description: 'Crie uma ${entity.label}'
}

const Create${naming.pascal}Page = () => {
  return <Form />
}

export default Create${naming.pascal}Page
`
}

export function generateEditPageContent(entity: ListEntityConfig): string {
  const naming = NamingUtils.generateVariations(entity.name)

  return `// Next Imports
import type { Metadata } from 'next'

// Component Imports
import Form from '@/views/dashboard/components/${naming.kebab}/form/index'

export const metadata: Metadata = {
  title: 'Editar ${entity.label}',
  description: 'Edite uma ${entity.label}'
}

const Edit${naming.pascal}Page = () => {
  return <Form />
}

export default Edit${naming.pascal}Page
`
}

export async function writeFormPages(
  entity: ListEntityConfig,
  projectRoot: string
): Promise<{ create: string; edit: string }> {
  const naming = NamingUtils.generateVariations(entity.name)

  // Create page path
  const createPagePath = path.join(projectRoot, 'src', 'app', '(dashboard)', naming.kebab, 'create')

  // Edit page path (note: /[id]/edit pattern)
  const editPagePath = path.join(projectRoot, 'src', 'app', '(dashboard)', naming.kebab, '[id]', 'edit')

  // Ensure directories exist
  await fs.ensureDir(createPagePath)
  await fs.ensureDir(editPagePath)

  // Write create page
  const createPath = path.join(createPagePath, 'page.tsx')
  const createContent = generateCreatePageContent(entity)
  await fs.writeFile(createPath, createContent, 'utf-8')

  // Write edit page
  const editPath = path.join(editPagePath, 'page.tsx')
  const editContent = generateEditPageContent(entity)
  await fs.writeFile(editPath, editContent, 'utf-8')

  return { create: createPath, edit: editPath }
}
