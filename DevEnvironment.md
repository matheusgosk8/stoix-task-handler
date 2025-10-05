**Instruções de como rodar o projeto localmente**

*O projeto depende de 2 variáveis de ambiente, os seus nomes foram colocados em .env.development*
*Alert - Nenhuma das variáveis são públicas, portanto devem ser adicionadas ao processo de build*
*DATABASE_URL -> Se trata da url de conexão com a base de dados, sem esta variável definida o projeto irá falhar.*
*JWT_SECRET -> Se trata do secret para realizar o encode do JWT para a autenticação*

*Após inserir as variáveis em src/.env basta utilizar*

``bash npm run dev``

*O projeto está configurado para iniciar  em: http://localhost:3000/*
