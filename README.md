# Projeto de Gestão de Tarefas

## Visão Geral

Este projeto foi inicialmente planejado para ser desenvolvido utilizando **React** com **serverless functions** (AWS Lambda). Para facilitar o desenvolvimento e acelerar a entrega, optamos por utilizar **Next.js**, que já gerencia rotas e funções server-side em background, simplificando a integração entre front-end e back-end.

Todos os **componentes de front-end** são **client-side components**, garantindo reatividade e interação dinâmica com o usuário.

---

## Validação de Dados

Para validar os payloads enviados pelo cliente, utilizamos o **Zod**.  
- Aplicado como middleware em todas as rotas POST.
- Garante que os dados recebidos pelo back-end estejam no formato esperado.

Exemplo de schema usado:

```ts
import { z } from "zod";

export const newTaskSchema = z.object({
  title: z.string().min(3, "A tarefa precisa de um nome"),
  description: z.string().optional(),
}); 
```

---

## Client-side e persistência

- **Redux** : Facilita as operações com states globais e gerenciamento de session e local storage.
- **Tailwind**: Facilita a criação de estilos para o projeto, este pacote oferece uma abordagem moderna e facilitada para a estilização dos componentes.

## Chamadas de api

Utilizamos dois pacotes para facilitar esta tarefa:

- **Axios** : Este pacote facilita a criação das chamadas de api pelo front-end, foram criadas duas funções auxiliares para lidar com as requisições, a 1º é para rotas que não requerem autenticação, como register e login e a 2º para rotas que exigem token de autenticação, nela usamos um interceptor de requisições para insertir o header com o token de segurança do redux. 

- **React query** : Este pacote é excelente para requisições dinâmicas e caching, permitindo a ativação de requisições através de componentes separados e isolados, melhor controle de refetch e re-render e mutações, permitindo a manutenção facilitada de side-effect das requisições.


## Database e ORM's

- **PostgreSQL** : Base de dados relacional muito versátil e robusta.
- **Drizzle** : Orm que facilita a criação de  migrações (compilação de schemas em ts para utilização em tabelas SQL), também proporciona maior facilidade e segurança nas queries.

## Funcionamento do projeto 

Seguindo as instruções, o projeto simplesmente permite a criação de tarefas, com o CRUD das mesmas, com a adição de um sistema de login/registro para implementar o uso de CSRF token nas requisições.
Basta criar uma conta com um username único e uma senha, realizar login com as mesmas e começar a criar as tarefas.


**Verificar também:**

- Estrutura.md -> Demonstra e explica a estrutura de páginas do projeto
- Backend.md -> Documenta as rotas de API do projeto