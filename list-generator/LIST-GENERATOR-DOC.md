# 🚀 Gerador de Listas

Sistema automatizado para geração de páginas de listagem completas no projeto.

## 📋 Como Usar

### 1. Criar Entity

Crie um arquivo `.entity.ts` em `list-generator/entity/` seguindo o modelo:

```typescript
// list-generator/entity/sua-entidade.entity.ts
import type { ListEntityConfig } from '../types/generator-types'

export const suaEntidadeEntity: ListEntityConfig = {
  name: 'sua-entidade',
  label: 'Sua Entidade',
  description: 'Gerencie sua entidade.',

  model: {
    name: 'SuaEntidadeType',
    outputPath: 'src/types/dashboard/suaEntidadeTypes.ts',
    fields: {
      id: { type: 'string' },
      name: { type: 'string' },
      status: { type: 'enum', values: ['Active', 'Inactive'] },
      created_at: { type: 'date' }
    }
  },

  page: {
    route: '/sua-entidade',
    appPath: 'src/app/(dashboard)/sua-entidade'
  },

  fakeDb: {
    enabled: true,
    path: 'src/fake-db/dashboard/suaEntidadeList.ts',
    initialAmount: 5
  },

  serverAction: {
    enabled: true,
    listFn: 'getSuaEntidadeData',
    getByIdFn: 'getSuaEntidadeById'
  },

  table: {
    selectable: true,
    pageSize: 10
  },

  filters: {
    search: true,
    status: true
  },

  columns: [
    {
      field: 'name',
      header: 'Nome',
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
  ]
}
```

### 2. Rodar o Gerador

```bash
pnpm generate:list
```

Selecione a entity desejada no menu interativo.

### 3. Arquivos Gerados

O generator cria automaticamente:

| Arquivo            | Localização                                                     | Descrição               |
| ------------------ | --------------------------------------------------------------- | ----------------------- |
| **Types**          | `src/types/dashboard/{entity}Types.ts`                          | Definições TypeScript   |
| **FakeDB**         | `src/fake-db/dashboard/{entity}List.ts`                         | Dados mockados          |
| **Server Actions** | `src/app/server/actions.ts`                                     | Funções injetadas       |
| **Columns**        | `src/app/(dashboard)/{entity}/hooks/columns.config.tsx`         | Configuração de colunas |
| **Hooks**          | `src/app/(dashboard)/{entity}/hooks/index.hook.ts`              | Hook de gerenciamento   |
| **Filters**        | `src/views/dashboard/components/{entity}/list/TableFilters.tsx` | Componente de filtros   |
| **ListTable**      | `src/views/dashboard/components/{entity}/list/ListTable.tsx`    | Tabela principal        |
| **List Index**     | `src/views/dashboard/components/{entity}/list/index.tsx`        | Wrapper da lista        |
| **Page (SSR)**     | `src/app/(dashboard)/{entity}/page.tsx`                         | Página principal        |

### 4. Rota Criada

Automaticamente disponível em: `/{entity}` (ex: `/book-products`)

## 🔄 Rollback

Reverter geração:

```bash
pnpm rollback:list
```

Opções:

- Reverter última geração
- Reverter por ID específico
- Listar todas as gerações

## ⚙️ Configurações da Entity

### Tipos de Coluna

- **text**: Texto simples (suporta `truncate: true`)
- **image**: Imagem com fallback
- **toggle**: Switch (Active/Inactive)
- **actions**: Botões de ação (edit, delete)

### Filtros Disponíveis

- **search**: Busca global em todos os campos
- **status**: Select de status (Active/Inactive)

### Campos Especiais

- `table.selectable`: Habilita checkbox de seleção múltipla
- `actions.menu.enabled`: Menu de três pontos (não implementado ainda)

## 🛠️ Ajustes Necessários

Após a geração, os devs devem ajustar:

1. **Campos Customizados**: Adicionar campos específicos no `columns.config.tsx`
2. **Filtros Complexos**: Implementar filtros avançados no `TableFilters.tsx`
3. **Validações**: Adicionar validações específicas de negócio
4. **Formatação**: Ajustar formatação de valores (datas, moedas, etc)
5. **Permissões**: Implementar controle de acesso baseado em roles

## 📦 Tipos de Campo

```typescript
type: 'string' | 'number' | 'boolean' | 'date' | 'enum'
```

**Enum:**

```typescript
{
  type: 'enum',
  values: ['Active', 'Inactive', 'Pending']
}
```

**Opcional:**

```typescript
{
  type: 'string',
  optional: true
}
```

## 🎯 Boas Práticas

- Use nomes em kebab-case para entities (ex: `book-products`)
- Sempre defina `label` e `description` claros
- Configure `pageSize` adequado ao volume de dados
- Habilite `selectable` apenas se necessário ações em lote
- Use `optional: true` para campos não obrigatórios

## 🐛 Troubleshooting

**Erro: "Nenhuma entity encontrada"**

- Verifique se o arquivo está em `list-generator/entity/`
- O arquivo deve terminar com `.entity.ts`

**Erro de TypeScript após geração**

- Execute: `pnpm lint:fix`
- Reinicie o TypeScript server no VSCode

**Rollback não funcionou**

- Verifique logs em `list-generator/logs/generations/`
- Use rollback por ID específico se necessário
