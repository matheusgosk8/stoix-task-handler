# Documentação da API - Projeto de Tarefas

Base URL: `http://localhost:3000/api`  

Todas as rotas usam **JSON** como formato de request e response.  
As rotas protegidas exigem **header de autenticação**:



| Método | Endpoint       | Descrição                                 | Body / Query Parameters | Retorno / Exemplo de Response |
|--------|----------------|-------------------------------------------|------------------------|-------------------------------|
| POST   | /login         | Realiza login do usuário                  | { "email": string, "password": string } | 200 OK: { "message": "Login realizado com sucesso!", "token": "<JWT_TOKEN>", "userId": "<USER_ID>" } <br> 400: { "message": "Campos inválidos", "error": "Invalid body schema" } <br> 401: { "message": "Email ou senha incorretos" } <br> 500: { "message": "Erro interno do servidor" } |
| POST   | /register      | Registra um novo usuário                  | { "name": string, "email": string, "password": string } | 200 OK: { "message": "Usuário registrado com sucesso!" } <br> 400: { "message": "Campos inválidos", "error": "Invalid body schema" } <br> 500: { "message": "Erro interno do servidor" } |
| GET    | /task          | Retorna todas as tarefas do usuário logado | Header: Authorization | 200 OK: { "message": "Tarefas do usuário recuperadas com sucesso", "tasks": [ { "id": "uuid", "userId": "uuid", "title": "Tarefa 1", "description": "Descrição", "done": false, "createdAt": "2025-10-05T12:00:00.000Z" } ] } <br> 401: { "message": "Usuário não autenticado" } <br> 500: { "message": "Erro interno do servidor" } |
| POST   | /task          | Cria uma nova tarefa                       | { "title": string, "description"?: string } | 200 OK: { "message": "Tarefa criada com sucesso!" } <br> 400: { "message": "Título obrigatório", "error": "Invalid body schema" } <br> 401: { "message": "Usuário não autenticado" } <br> 500: { "message": "Erro interno do servidor" } |
| PUT    | /task          | Atualiza uma tarefa existente             | { "id": string, "title": string, "description"?: string, "done": boolean } | 200 OK: { "message": "Tarefa atualizada com sucesso!", "task": { "id": "uuid", "title": "Título atualizado", "description": "Descrição atualizada", "done": true, "createdAt": "2025-10-05T12:00:00.000Z" } } <br> 400: { "message": "Campos inválidos" } <br> 401: { "message": "Usuário não autenticado" } <br> 500: { "message": "Erro interno do servidor" } |
| DELETE | /task          | Deleta uma ou mais tarefas                | Query: taskid=uuid1,uuid2,... | 200 OK: { "message": "Tarefa(s) deletada(s) com sucesso!" } <br> 400: { "message": "ID(s) não fornecido(s)" } <br> 401: { "message": "Usuário não autenticado" } <br> 500: { "message": "Erro interno do servidor" } |

---

### Observações

- Todas as respostas de erro seguem o padrão:

```json
{
  "message": "Descrição do erro",
  "code": 400,
  "error": "Detalhes técnicos (opcional)"
}
