# Currency Fields (Campos Monetários)

## Visão Geral

O generator suporta campos de valores monetários através da flag `currency: true` na configuração de campos do formulário.

## Como Usar

### 1. Configurar o Campo na Entity

Adicione `currency: true` em campos do tipo `number` que representam valores monetários:

```typescript
{
  name: 'price',
  label: 'Preço',
  type: 'number',
  currency: true,  // ← Flag que habilita formatação currency
  required: true,
  placeholder: '0,00',
  grid: { xs: 12, sm: 4 },
  validation: {
    min: 0,
    message: 'O preço deve ser maior que 0'
  }
}
```

### 2. O Que é Gerado

Quando `currency: true` está presente, o generator cria:

```tsx
<Controller
  name='price'
  control={page.control}
  render={({ field }) => (
    <CustomTextField
      {...field}
      value={field.value ? String(field.value) : ''}
      fullWidth
      label='Preço'
      placeholder='0,00'
      error={!!page.errors.price}
      helperText={page.errors.price?.message}
      InputProps={{
        startAdornment: <InputAdornment position='start'>R$</InputAdornment>,
        inputComponent: CurrencyInput
      }}
    />
  )}
/>
```

### 3. Imports Automáticos

O generator adiciona automaticamente os imports necessários:

```tsx
import { InputAdornment } from '@mui/material'
import CurrencyInput from '../../financial-products/form/CurrencyInput'
```

## Comportamento

### Formatação

- **Visual**: Mostra valores com vírgula decimal e separador de milhares
- **Exemplo**: Usuário digita "50000" → Mostra "50.000,00"

### Armazenamento

- O valor é armazenado como **número puro** (não em centavos)
- CurrencyInput gerencia a conversão automaticamente
- Backend recebe o valor como número (ex: 50000.00)

### Se Precisar Armazenar em Centavos

Se o backend espera valores em centavos, faça a conversão no `onSubmit` do hook:

```typescript
const onSubmit = useCallback((data: any) => {
  const payload = {
    ...data,
    price: data.price ? Math.round(data.price * 100) : 0,
    installment_price: data.installment_price ? Math.round(data.installment_price * 100) : 0
  }

  // Enviar payload ao backend
}, [])
```

## Exemplo Completo

```typescript
// list-generator/entity/products.entity.ts
export const productsEntity: ListEntityConfig = {
  name: 'products',
  label: 'Produtos',

  form: {
    fields: [
      {
        name: 'price',
        label: 'Preço',
        type: 'number',
        currency: true, // ✓ Ativa formatação currency
        required: true,
        grid: { xs: 12, sm: 4 }
      },
      {
        name: 'installment_price',
        label: 'Preço Parcelado',
        type: 'number',
        currency: true, // ✓ Ativa formatação currency
        required: true,
        grid: { xs: 12, sm: 4 }
      },
      {
        name: 'quantity',
        label: 'Quantidade',
        type: 'number',
        // currency: false ← Campo numérico normal (sem formatação)
        required: true,
        grid: { xs: 12, sm: 4 }
      }
    ]
  }
}
```

## Diferenças: Currency vs Number Normal

| Aspecto            | `currency: true` | Sem flag                |
| ------------------ | ---------------- | ----------------------- |
| Componente         | CurrencyInput    | TextField type="number" |
| Prefixo            | R$               | -                       |
| Formatação         | 1.000,00         | 1000                    |
| Vírgula decimal    | Sim              | Não                     |
| Separador milhares | Sim              | Não                     |

## Troubleshooting

### Campo não mostra formatação

- Verifique se `currency: true` está na entity
- Confirme que o tipo do campo é `'number'`
- Regenere o formulário: `pnpm generate:form`

### Imports não foram adicionados

- CurrencyInput deve existir em `src/views/dashboard/components/financial-products/form/CurrencyInput.tsx`
- Verifique se o gerador detectou `hasCurrencyField`

### Valores não são salvos corretamente

- CurrencyInput retorna valores como números decimais
- Se backend espera centavos, converta no onSubmit do hook
