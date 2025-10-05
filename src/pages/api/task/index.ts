import type { NextApiRequest, NextApiResponse } from 'next';
import { createTask, updateTask, deleteTask } from '@/persistance/task';
import { errorHandler } from '@/utils/errorHandler';
import { validateBody } from '@/utils/bodyParser';
import { newTaskSchema, updateTaskSchema, deleteTaskSchema } from '@/schemas/task';
import type { RegisterResponse, TasksResponse } from '@/models/server';
import { NewTaskInput } from '@/models/client';
import { getUserIdFromHeader } from '@/utils/userIdParser';
import { getUserTasks } from '@/provider/task';
import { authMiddleware } from '@/middlewhare/auth';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<RegisterResponse | TasksResponse>
) {
    try {

        const userId = authMiddleware(req, res);
        if (!userId) return;

        if (req.method === 'GET') {

            const tasks = await getUserTasks(userId as string);

            if (!tasks || tasks === null) {
                return errorHandler(res, { message: "Erro ao buscar as tarefas", code: 500 })
            }

            const response: TasksResponse = {
                message: "Tarefas do usuário recuperadas com sucesso",
                tasks
            }

            return res.status(200).json(response);

        }



        if (req.method === 'POST') {

            const { data, errors } = await validateBody(newTaskSchema, req);
            if (errors) {
                const errorMessages = Object.values(errors).flat().join(', ');
                return errorHandler(res, { message: errorMessages, code: 400 });
            }

            const userId = getUserIdFromHeader(req, res);
            const newTask = await createTask(userId as string, data as NewTaskInput);

            if (!newTask) return errorHandler(res, { message: 'Erro ao criar tarefa', code: 400 });

            return res.status(200).json({ message: 'Tarefa criada com sucesso!' });
        }

        if (req.method === 'PUT') {
            const { data, errors } = await validateBody(updateTaskSchema, req);
            if (errors) {
                const errorMessages = Object.values(errors).flat().join(', ');
                return errorHandler(res, { message: errorMessages, code: 400 });
            }

            if (!data) {
                return res.status(200).json({ message: 'Tarefa atualizada com sucesso!' });
            }

            const updated = await updateTask(data?.id as string, data);
            if (!updated) return errorHandler(res, { message: 'Erro ao atualizar tarefa', code: 400 });

            return res.status(200).json({ message: 'Tarefa atualizada com sucesso!' });
        }

        if (req.method === "DELETE") {
            const { taskid } = req.query;
    
            const taskIds = (Array.isArray(taskid) ? taskid : [taskid])
              .filter((id): id is string => typeof id === "string" && id.trim().length > 0);
          
            if (taskIds.length === 0) {
              return errorHandler(res, {
                message: "Nenhum ID de tarefa fornecido.",
                code: 400,
              });
            }
          
            try {
              const results = await Promise.all(taskIds.map(id => deleteTask(id)));
          
              const allDeleted = results.every(Boolean);
          
              if (!allDeleted) {
                return errorHandler(res, {
                  message: "Erro ao deletar uma ou mais tarefas.",
                  code: 400,
                });
              }
          
              return res
                .status(200)
                .json({ message: "Tarefas deletadas com sucesso!" });

            } catch (error) {
              console.error("Erro ao deletar tarefas:", error);
              return errorHandler(res, {
                message: "Erro interno ao deletar tarefas.",
                code: 500,
              });
            }
          }
          
          

        return res.status(405).json({ message: 'Method Not Allowed' });
    } catch (error) {
        console.error(error);
        return errorHandler(res, { message: 'Erro interno', code: 500 });
    }
}
