**Estrutura geral do projeto**

src/
│
├─ app/                           # Diretório do Next.js (rotas e layouts)
│   ├─ page.tsx                   # Página inicial - Pública
│   ├─ login
│   |   └─ index.tsx              # Página de login - Pública
│   ├─ registro
│   |   └─ index.tsx              # Página de registro do usuário - Pública
│   ├─ tarefas
│   |   └─ index.tsx              # Página das tarefas do usuário - Requer Auth
│   └─ layout.tsx                 # Layout global com providers (Redux, React Query)
|
├─ app/pages/api                           # Diretório do Next.js (rotas e layouts)
│   ├─ login 
|   |  └─ index.ts                # Rota de login - Pública
│   ├─ register                  
|   |  └─ index.ts                # Rota de registro - Pública
|   └─ tasks  
|      └─ index.ts                # Rota de CRUD das tarefas
|
├─ components/                    # Componentes React (client-side)
│   ├─ task/                      # Componentes relacionados a tarefas
│
├─ hooks/                         # Pasta com hooks do react
│ 
├─ providers/
|   ├─ ReactQueryProvider.tsx  
|   |─ ToastProvider.tsx          # Provider do sooner toasts
│   └─ ReduxProvider.ts           # Provider do redux
│
├─ lib/                           # Configurações de bibliotecas
│   ├─ store.ts                   # Configuração do Redux + persist
│   └─ reactQuery.ts              # Configuração do React Query
│
├─ models/                        # Tipagens TypeScript
│   ├─ client.ts                  # Tipos para front-end
│   └─ server.ts                  # Tipos para back-end
│
├─ persistance/                   # Funções de escrita ao banco (Drizzle ORM)
│   └─ task.ts                    # CRUD de tarefas
|        
├─ provider/                      # Funções de leitura ao banco (Drizzle ORM)
│
├─ schemas/                       # Schemas de validação Zod
│
├─ services/                      # Hooks do React Query e interações API
│   └─ tasksActions.ts
│
├─ config/                        # Pasta de configurações do drizzle e da base de dados
│   └─ db
│
└─ utils/                         # Funções utilitárias
    ├─ bodyParser.ts
    └─ errorHandler.ts
