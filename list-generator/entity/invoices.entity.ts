// list-generator/entities/invoices.entity.ts
import type { ListEntityConfig } from '../types/generator-types'

export const invoicesEntity: ListEntityConfig = {
  name: 'invoices',

  label: 'Faturas',
  description: 'Gerencie as faturas e cobranças da sua instituição.',

  /** =========================
   * MODEL (fonte da verdade)
   * ========================= */
  model: {
    name: 'InvoiceType',
    outputPath: 'src/types/dashboard/invoiceTypes.ts',

    fields: {
      id: { type: 'string' },
      invoice_id: { type: 'number' },
      vindi_code: { type: 'number' },
      enrollment_id: { type: 'number' },
      student_name: { type: 'string' },
      series_name: { type: 'string' },
      class_name: { type: 'string' },
      amount: { type: 'number' },
      installment_number: { type: 'number' },
      due_date: { type: 'date' },
      status: {
        type: 'enum',
        values: ['paid', 'overdue', 'pending', 'cancelled']
      },
      purpose: { type: 'string' },
      created_at: { type: 'date' },
      updated_at: { type: 'date' }
    }
  },

  /** =========================
   * PAGE
   * ========================= */
  page: {
    route: '/invoices',
    appPath: 'src/app/(dashboard)/invoices',
    files: {
      page: 'page.tsx'
    }
  },

  /** =========================
   * FAKE DB
   * ========================= */
  fakeDb: {
    enabled: true,
    path: 'src/fake-db/dashboard/invoiceList.ts',
    initialAmount: 10
  },

  /** =========================
   * SERVER ACTIONS
   * ========================= */
  serverAction: {
    enabled: true,
    listFn: 'getInvoicesData',
    getByIdFn: 'getInvoiceById'
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
   * FILTERS (modelo complexo com collapse)
   * ========================= */
  filters: {
    /** Campo de busca global */
    search: true,

    /** Habilita collapse para os filtros */
    collapsible: true,

    /** Filtros customizados em collapse */
    custom: [
      {
        field: 'year',
        label: 'Ano',
        type: 'select',
        options: ['2024', '2025', '2026']
      },
      {
        field: 'series_name',
        label: 'Série',
        type: 'select',
        options: ['serie 1', 'serie 2', 'serie 3'],
        multiple: true
      },
      {
        field: 'class_name',
        label: 'Turma',
        type: 'select',
        options: ['turma 1', 'turma 2'], // Será populado via API
        multiple: true
      },
      {
        field: 'installment_number',
        label: 'Nº da Parcela',
        type: 'number'
      },
      {
        field: 'purpose',
        label: 'Finalidade',
        type: 'select',
        options: ['Mensalidade', 'Material', 'Uniforme', 'Atividade Extra']
      },
      {
        field: 'status',
        label: 'Situação',
        type: 'select',
        options: [
          { value: 'paid', label: 'Pago' },
          { value: 'overdue', label: 'Em Atraso' },
          { value: 'pending', label: 'Pendente' },
          { value: 'cancelled', label: 'Cancelado' }
        ]
      }
    ]
  },

  /** =========================
   * COLUMNS
   * ========================= */
  columns: [
    {
      field: 'invoice_id',
      header: 'Fatura',
      type: 'text',
      show: true
    },
    {
      field: 'vindi_code',
      header: 'Código Vindi',
      type: 'text',
      show: true
    },
    {
      field: 'enrollment_id',
      header: 'Matrícula',
      type: 'text',
      show: true
    },
    {
      field: 'student_name',
      header: 'Aluno',
      type: 'text',
      show: true,
      truncate: true
    },
    {
      field: 'series_name',
      header: 'Série',
      type: 'text',
      show: true
    },
    {
      field: 'class_name',
      header: 'Turma',
      type: 'text',
      show: true
    },
    {
      field: 'amount',
      header: 'Valor',
      type: 'currency',
      show: true
    },
    {
      field: 'installment_number',
      header: 'Parcela',
      type: 'text',
      show: true
    },
    {
      field: 'due_date',
      header: 'Vencimento',
      type: 'date',
      show: true
    },
    {
      field: 'status',
      header: 'Situação',
      type: 'chip',
      show: true,
      chipColors: {
        paid: 'success',
        overdue: 'error',
        pending: 'info',
        cancelled: 'secondary'
      },
      chipLabels: {
        paid: 'Pago',
        overdue: 'Em Atraso',
        pending: 'Pendente',
        cancelled: 'Cancelado'
      }
    }
  ]

  // Não tem formulário de criação/edição - apenas visualização e ações
}
