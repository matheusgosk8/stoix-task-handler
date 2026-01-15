// list-generator/entities/services-payments.entity.ts
import type { ListEntityConfig } from '../types/generator-types'

export const servicesPaymentsEntity: ListEntityConfig = {
  name: 'services-payments',
  label: 'Pagamentos de Serviços',
  description: 'Gerencie os pagamentos de serviços da sua instituição.',

  /** =========================
   * MODEL (fonte da verdade)
   * ========================= */
  model: {
    name: 'ServicePaymentType',
    outputPath: 'src/types/dashboard/servicePaymentTypes.ts',
    fields: {
      id: { type: 'string' },
      name: { type: 'string' },
      unitId: { type: 'string' }, // id da unidade
      unitName: { type: 'string' }, // nome da unidade
      amount: { type: 'number' },
      installments: { type: 'number' },
      due_rule: { type: 'string' },
      isActive: { type: 'boolean' },
      deletedAt: { type: 'date | null' }
    }
  },

  /** =========================
   * PAGE
   * ========================= */
  page: {
    route: '/services-payments',
    appPath: 'src/app/(dashboard)/services-payments',
    files: {
      page: 'page.tsx'
    }
  },

  /** =========================
   * FAKE DB
   * ========================= */
  fakeDb: {
    enabled: true,
    path: 'src/fake-db/dashboard/servicePaymentList.ts',
    initialAmount: 5
  },

  /** =========================
   * SERVER ACTIONS
   * ========================= */
  serverAction: {
    enabled: true,
    listFn: 'getServicePaymentsData',
    getByIdFn: 'getServicePaymentById'
  },

  /** =========================
   * TABLE
   * ========================= */
  table: {
    /** Habilita checkbox de seleção múltipla na primeira coluna */
    selectable: true,

    /** Tamanho padrão de paginação */
    pageSize: 10
  },

  /** =========================
   * FILTERS
   * ========================= */
  filters: {
    /** Campo de busca global */
    search: true,
    status: true
  },

  /** =========================
   * COLUMNS
   * ========================= */
  columns: [
    { field: 'name', header: 'Título', type: 'text', show: true, truncate: true },
    { field: 'unitId', header: 'Unidade', type: 'text', show: true },
    { field: 'unitName', header: 'Unidade', type: 'text', show: true },
    { field: 'amount', header: 'Valor', type: 'currency', show: true },
    { field: 'installments', header: 'Parcelas', type: 'text', show: true },
    { field: 'due_rule', header: 'Regra de Vencimento', type: 'text', show: true },
    { field: 'isActive', header: 'Situação', type: 'toggle', show: true, activeValue: 'true', inactiveValue: 'false' },
    {
      field: 'action',
      header: 'Ações',
      type: 'actions',
      show: true,
      actions: { edit: true, delete: true, menu: { enabled: false } }
    }
  ],

  /** =========================
   * FORM
   * ========================= */
  form: {
    sections: [
      {
        title: 'Dados do Serviço',
        fields: ['name', 'unitId', 'amount', 'installments', 'due_rule', 'isActive']
      }
    ],
    fields: [
      {
        name: 'name',
        label: 'Título',
        type: 'text',
        required: true,
        placeholder: 'Digite o nome do serviço',
        grid: { xs: 12, sm: 6 }
      },
      {
        name: 'unitId',
        label: 'Unidade',
        type: 'select',
        required: true,
        placeholder: 'Selecione a unidade',
        grid: { xs: 12, sm: 6 },
        options: [
          { label: 'Unidade 1', value: '1' },
          { label: 'Unidade 2', value: '2' },
          { label: 'Unidade 3', value: '3' }
        ]
      },
      {
        name: 'amount',
        label: 'Valor',
        type: 'number',
        currency: true,
        required: true,
        placeholder: '0,00',
        grid: { xs: 12, sm: 4 }
      },
      {
        name: 'installments',
        label: 'Parcelas',
        type: 'number',
        required: true,
        placeholder: 'Ex: 12',
        grid: { xs: 12, sm: 4 }
      },
      {
        name: 'due_rule',
        label: 'Regra de Vencimento',
        type: 'select',
        required: true,
        placeholder: 'Selecione a regra',
        grid: { xs: 12, sm: 4 },
        options: [
          { label: 'Todo dia 5', value: 'todo dia 5' },
          { label: 'Todo dia 10', value: 'todo dia 10' },
          { label: 'Todo dia 15', value: 'todo dia 15' },
          { label: 'Todo dia 25', value: 'todo dia 25' },
          { label: 'Último dia do mês', value: 'ultimo dia do mes' }
        ]
      },
      { name: 'isActive', label: 'Ativo', type: 'radio', required: false, grid: { xs: 12, sm: 4 } }
    ]
  }
}
