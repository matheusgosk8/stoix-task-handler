// list-generator/writters/list.writter.ts
import fs from 'fs-extra'
import path from 'path'
import type { ListEntityConfig } from '../types/generator-types'
import { NamingUtils } from '../utils/naming'

/**
 * Gera o conteúdo do arquivo ListTable.tsx
 */
export function generateListTableFileContent(entity: ListEntityConfig): string {
  const { name, model, label, description, filters } = entity
  const naming = NamingUtils.generateVariations(name)

  // Tipo do dado
  const dataType = model.name

  // Nome do arquivo de types
  const typesFileName = path.basename(model.outputPath, '.ts')

  // Nome do hook
  const hookName = `use${naming.pascal}`

  // Rota para criar novo
  const createRoute = `/${naming.kebab}/create`

  // Verifica se os filtros são collapsible
  const collapsible = filters?.collapsible || false

  // Se for collapsible, renderiza de forma diferente
  const filtersSection = collapsible
    ? `        <div>
          <TableFilters setData={props.setFilteredData} tableData={props.data} />
        </div>`
    : `        <CardHeader title='Filtros' className='pbe-4' />
        <TableFilters setData={props.setFilteredData} tableData={props.data} />`

  return `'use client'

import { useRouter } from 'next/navigation'

import { flexRender } from '@tanstack/react-table'
import classnames from 'classnames'
import TablePagination from '@mui/material/TablePagination'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'

import { CardHeader } from '@mui/material'

import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'
import TableFilters from './TableFilters'
import { ${hookName} } from '@/app/(dashboard)/${naming.kebab}/hooks/index.hook'
import tableStyles from '@core/styles/table.module.css'
import type { ${dataType} } from '@/types/dashboard/${typesFileName}'

const ListTable = ({ tableData }: { tableData?: ${dataType}[] }) => {
  const props = ${hookName}(tableData)
  const router = useRouter()

  return (
    <>
      <div className='flex flex-wrap flex-col mb-8'>
        <Typography variant='h4' className='mbe-1'>
          ${label}
        </Typography>
        <Typography>${description || 'Lista de registros.'}</Typography>
      </div>

      <Card>
${filtersSection}

        <div className='flex justify-between flex-col items-start md:flex-row md:items-center p-6 border-bs gap-4'>
          <CustomTextField
            select
            value={props.table.getState().pagination.pageSize}
            onChange={e => props.table.setPageSize(Number(e.target.value))}
            className='sm:is-[70px] max-sm:is-full'
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
          </CustomTextField>

          <div className='flex gap-4 max-sm:justify-end'>
            <Button
              onClick={() => router.push('${createRoute}')}
              variant='contained'
              startIcon={<i className='tabler-plus' />}
            >
              Adicionar
            </Button>

            <Button variant='tonal' color='error' startIcon={<i className='tabler-trash' />}>
              Excluir
            </Button>
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              {props.table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      {...(header.id === 'select' && { width: '50' })}
                      {...(header.id === 'action' && { width: '100' })}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={classnames({
                            'flex items-center': header.column.getIsSorted(),
                            'cursor-pointer select-none': header.column.getCanSort()
                          })}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: <i className='tabler-chevron-up text-xl' />,
                            desc: <i className='tabler-chevron-down text-xl' />
                          }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            {props.table.getFilteredRowModel().rows.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={props.table.getVisibleFlatColumns().length} className='text-center'>
                    Nenhum registro
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {props.table
                  .getRowModel()
                  .rows.slice(0, props.table.getState().pagination.pageSize)
                  .map(row => (
                    <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            )}
          </table>
        </div>

        <TablePagination
          component={() => <TablePaginationComponent table={props.table} />}
          count={props.table.getFilteredRowModel().rows.length}
          rowsPerPage={props.table.getState().pagination.pageSize}
          page={props.table.getState().pagination.pageIndex}
          onPageChange={(_, page) => props.table.setPageIndex(page)}
        />
      </Card>
    </>
  )
}

export default ListTable
`
}

/**
 * Escreve o arquivo ListTable.tsx
 */
export async function writeListTable(entity: ListEntityConfig, projectRoot: string): Promise<{ created: string[] }> {
  const naming = NamingUtils.generateVariations(entity.name)

  // Caminho: src/views/dashboard/components/book-products/list/ListTable.tsx
  const listDir = path.join(projectRoot, 'src/views/dashboard/components', naming.kebab, 'list')
  const listTablePath = path.join(listDir, 'ListTable.tsx')

  // Cria diretório se não existir
  await fs.ensureDir(listDir)

  // Gera conteúdo
  const content = generateListTableFileContent(entity)

  // Escreve arquivo
  await fs.writeFile(listTablePath, content, 'utf-8')

  console.log(`✅ ListTable gerado: ${listTablePath}`)

  return {
    created: [listTablePath]
  }
}
