// list-generator/entities/book-products.entity.ts
import type { ListEntityConfig } from '../types/generator-types'

export const bookProductsEntity: ListEntityConfig = {
  name: 'book-products',

  label: 'Produtos de Livros',
  description: 'Gerencie os produtos de livros da sua instituição.',

  /** =========================
   * MODEL (fonte da verdade)
   * ========================= */
  model: {
    name: 'BookProductType',
    outputPath: 'src/types/dashboard/bookProductsTypes.ts',

    fields: {
      id: { type: 'string' },
      code: { type: 'string' },
      title: { type: 'string' },
      description: { type: 'string' },
      price: { type: 'number' },
      installment_price: { type: 'number' },
      max_installments: { type: 'number' },
      year: { type: 'number' },
      created_at: { type: 'date' },
      updated_at: { type: 'date' },
      status: {
        type: 'enum',
        values: ['Active', 'Inactive']
      }
    }
  },

  /** =========================
   * PAGE
   * ========================= */
  page: {
    route: '/book-products',
    appPath: 'src/app/(dashboard)/book-products',
    files: {
      page: 'page.tsx'
    }
  },

  /** =========================
   * FAKE DB
   * ========================= */
  fakeDb: {
    enabled: true,
    path: 'src/fake-db/dashboard/bookProductList.ts',
    initialAmount: 5
  },

  /** =========================
   * SERVER ACTIONS
   * ========================= */
  serverAction: {
    enabled: true,
    listFn: 'getBookProductsData',
    getByIdFn: 'getBookProductById'
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

    /** Select de status (se tiver campo status no model) */
    status: true
  },

  /** =========================
   * COLUMNS
   * ========================= */
  columns: [
    {
      field: 'title',
      header: 'Título',
      type: 'text',
      show: true,
      truncate: true
    },
    {
      field: 'description',
      header: 'Descrição',
      type: 'text',
      show: true,
      truncate: true
    },
    {
      field: 'price',
      header: 'Preço',
      type: 'text',
      show: true
    },
    {
      field: 'status',
      header: 'Situação',
      type: 'toggle',
      show: true,
      activeValue: 'Active',
      inactiveValue: 'Inactive'
    },
    {
      field: 'action',
      header: 'Ações',
      type: 'actions',
      show: true,
      actions: {
        edit: true,
        delete: true,
        menu: {
          enabled: false
        }
      }
    }
  ],

  /** =========================
   * FORM
   * ========================= */
  form: {
    sections: [
      {
        title: 'Dados Cadastrais',
        fields: ['title', 'description', 'code', 'year', 'status']
      },
      {
        title: 'Preços e Parcelamento',
        fields: ['price', 'installment_price', 'max_installments']
      }
    ],
    fields: [
      {
        name: 'title',
        label: 'Título',
        type: 'text',
        required: true,
        placeholder: 'Digite o título do produto',
        grid: { xs: 12, sm: 6 },
        validation: {
          min: 3,
          message: 'O título deve ter no mínimo 3 caracteres'
        }
      },
      {
        name: 'description',
        label: 'Descrição',
        type: 'textarea',
        required: true,
        placeholder: 'Digite a descrição do produto',
        grid: { xs: 12 },
        validation: {
          min: 10,
          message: 'A descrição deve ter no mínimo 10 caracteres'
        }
      },
      {
        name: 'code',
        label: 'Código',
        type: 'text',
        required: true,
        placeholder: 'Digite o código do produto',
        grid: { xs: 12, sm: 6 }
      },
      {
        name: 'year',
        label: 'Ano',
        type: 'number',
        required: true,
        placeholder: 'Digite o ano',
        grid: { xs: 12, sm: 6 },
        validation: {
          min: 2000,
          max: 2100,
          message: 'Ano inválido'
        }
      },
      {
        name: 'status',
        label: 'Status',
        type: 'radio',
        required: true,
        grid: { xs: 12, sm: 6 },
        options: [
          { label: 'Ativo', value: 'Active' },
          { label: 'Inativo', value: 'Inactive' }
        ]
      },
      {
        name: 'price',
        label: 'Preço',
        type: 'number',
        currency: true,
        required: true,
        placeholder: '0,00',
        grid: { xs: 12, sm: 4 },
        validation: {
          min: 0,
          message: 'O preço deve ser maior que 0'
        }
      },
      {
        name: 'installment_price',
        label: 'Preço Parcelado',
        type: 'number',
        currency: true,
        required: true,
        placeholder: '0,00',
        grid: { xs: 12, sm: 4 },
        validation: {
          min: 0,
          message: 'O preço parcelado deve ser maior que 0'
        }
      },
      {
        name: 'max_installments',
        label: 'Máximo de Parcelas',
        type: 'number',
        required: true,
        placeholder: 'Ex: 12',
        grid: { xs: 12, sm: 4 },
        validation: {
          min: 1,
          max: 24,
          message: 'Máximo de 24 parcelas'
        }
      }
    ]
  }
}
