// list-generator/writters/hooks.writter.ts
import fs from 'fs-extra'
import path from 'path'
import type { ListEntityConfig } from '../types/generator-types'
import { NamingUtils } from '../utils/naming'

/**
 * Gera o conteúdo do arquivo index.hook.ts
 */
export function generateHooksFileContent(entity: ListEntityConfig): string {
  const { name, model, table } = entity
  const naming = NamingUtils.generateVariations(name)

  // Tipo do dado (ex: BookProductType)
  const dataType = model.name

  // Nome do hook (ex: useBookProducts)
  const hookName = `use${naming.pascal}`

  // Nome do arquivo de types
  const typesFileName = path.basename(model.outputPath, '.ts')

  // Page size padrão
  const pageSize = table?.pageSize || 10

  return `'use client'

import { useMemo, useState, useEffect } from 'react'

import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable
} from '@tanstack/react-table'

import { rankItem } from '@tanstack/match-sorter-utils'

import { createColumns } from './columns.config'
import type { ${dataType} } from '@/types/dashboard/${typesFileName}'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })

  return itemRank.passed
}

export const ${hookName} = (tableData?: ${dataType}[]) => {
  const [data, setData] = useState<${dataType}[]>(tableData || [])
  const [filteredData, setFilteredData] = useState<${dataType}[]>(data)

  useEffect(() => {
    if (tableData) {
      setData(tableData)
      setFilteredData(tableData)
    }
  }, [tableData])

  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState({})

  const columns: ColumnDef<${dataType}, any>[] = useMemo(() => createColumns(data, setData), [data])

  const table = useReactTable({
    data: filteredData,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: { rowSelection, globalFilter },
    initialState: { pagination: { pageSize: ${pageSize} } },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  return {
    data,
    setData,
    filteredData,
    setFilteredData,
    globalFilter,
    setGlobalFilter,
    rowSelection,
    setRowSelection,
    columns,
    table,
    fuzzyFilter
  }
}
`
}

/**
 * Escreve o arquivo index.hook.ts
 */
export async function writeHooks(entity: ListEntityConfig, projectRoot: string): Promise<{ created: string[] }> {
  const naming = NamingUtils.generateVariations(entity.name)

  // Caminho: src/app/(dashboard)/book-products/hooks/index.hook.ts
  const hooksDir = path.join(projectRoot, 'src/app/(dashboard)', naming.kebab, 'hooks')
  const hooksPath = path.join(hooksDir, 'index.hook.ts')

  // Cria diretório se não existir
  await fs.ensureDir(hooksDir)

  // Gera conteúdo
  const content = generateHooksFileContent(entity)

  // Escreve arquivo
  await fs.writeFile(hooksPath, content, 'utf-8')

  console.log(`✅ Hooks gerado: ${hooksPath}`)

  return {
    created: [hooksPath]
  }
}
