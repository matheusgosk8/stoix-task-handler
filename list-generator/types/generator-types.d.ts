// list-generator/types/entity.ts

export type EntityTypeRef = {
  name: string
  importPath: string
}

export type EntityPageConfig = {
  route: string
  appPath: string
  files?: {
    page?: string
    loading?: boolean
    error?: boolean
  }
}

export type FakeDbConfig = {
  enabled: boolean
  path: string
  initialAmount?: number
}

export type ServerActionConfig = {
  enabled: boolean
  listFn: string
  getByIdFn?: string
}

export type BaseColumnConfig = {
  field: string
  header: string
  show: boolean
  width?: number
}

export type TextColumnConfig = BaseColumnConfig & {
  type: 'text'
  sortable?: boolean
  truncate?: boolean
}

export type CurrencyColumnConfig = BaseColumnConfig & {
  type: 'currency'
  sortable?: boolean
}

export type DateColumnConfig = BaseColumnConfig & {
  type: 'date'
  sortable?: boolean
  format?: string // Ex: 'dd/MM/yyyy', 'dd/MM/yyyy HH:mm'
}

export type ChipColumnConfig = BaseColumnConfig & {
  type: 'chip'
  chipColors?: Record<string, 'success' | 'error' | 'warning' | 'info' | 'primary' | 'secondary' | 'default'>
  chipLabels?: Record<string, string>
  variant?: 'filled' | 'outlined'
}

export type ImageColumnConfig = BaseColumnConfig & {
  type: 'image'
  fallback?: string
}

export type ToggleColumnConfig = BaseColumnConfig & {
  type: 'toggle'
  activeValue: string
  inactiveValue: string
}

export type ActionsColumnConfig = BaseColumnConfig & {
  type: 'actions'
  actions: {
    /** Botão direto de editar */
    edit?: boolean

    /** Botão direto de deletar */
    delete?: boolean

    /** Menu de opções (três pontos "...") */
    menu?: {
      /** Se true, renderiza OptionMenu com as opções */
      enabled: boolean

      /** Opções customizadas do menu */
      items?: Array<{
        label: string
        icon: string
        action: string
        color?: 'error' | 'warning' | 'success' | 'info' | 'primary' | 'secondary'
      }>

      /** Opções pré-definidas (deprecated, use items) */
      options?: Array<'download' | 'duplicate' | 'archive' | 'export' | 'share' | 'print'>
    }
  }
}

export type EntityColumnConfig =
  | TextColumnConfig
  | CurrencyColumnConfig
  | DateColumnConfig
  | ChipColumnConfig
  | ImageColumnConfig
  | ToggleColumnConfig
  | ActionsColumnConfig

// list-generator/types/entity.ts

export type ListEntityConfig = {
  name: string

  // UI
  label: string
  description?: string

  model?: any

  // Next.js
  page: EntityPageConfig

  // fake backend
  fakeDb?: FakeDbConfig

  // server actions
  serverAction?: ServerActionConfig

  // tabela (padrão)
  table?: {
    /** Habilita coluna de checkbox para seleção múltipla */
    selectable?: boolean

    /** Tamanho padrão de paginação */
    pageSize?: number
  }

  // filtros
  filters?: {
    /** Campo de busca global */
    search?: boolean

    /** Select de status (ativo/inativo) */
    status?: boolean

    /** Se true, renderiza os filtros dentro de um Collapse expansível */
    collapsible?: boolean

    /** Filtros customizados (para filtros complexos com collapse) */
    custom?: Array<{
      field: string
      label: string
      type: 'select' | 'number' | 'date' | 'dateRange'
      options?: Array<string | { value: string; label: string }>
      multiple?: boolean
    }>
  }

  // formulário (create/edit)
  form?: FormConfig

  // colunas
  columns: EntityColumnConfig[]
}

// ========== FORM TYPES ==========

export type FormFieldType = 'text' | 'number' | 'radio' | 'select' | 'textarea' | 'date'

export type FormFieldOption = {
  value: string | number
  label: string
}

export type FormFieldConfig = {
  name: string
  label: string
  type: FormFieldType
  required?: boolean
  placeholder?: string
  defaultValue?: any
  options?: FormFieldOption[]
  /** Indica se o campo é do tipo currency (valores monetários) */
  currency?: boolean
  validation?: {
    min?: number
    max?: number
    message?: string
  }
  grid?: {
    xs?: number
    sm?: number
    md?: number
  }
}

export type FormSectionConfig = {
  title: string
  fields: string[]
}

export type FormConfig = {
  fields: FormFieldConfig[]
  sections?: FormSectionConfig[]
}
