import { z } from "zod";

export const newTaskSchema = z.object({
    title: z.string().min(3, "A tarefa precisa de um nome"),
    description: z.string().optional()
});


export const updateTaskSchema = z.object({
    id: z.string().min(1 ,"ID inválido"),
    title: z.string().min(3, "A tarefa precisa de um nome").optional(),
    description: z.string().optional(),
    done: z.boolean().optional(),
});

export const deleteTaskSchema = z.object({
    id: z.string().uuid("ID inválido da tarefa"),
});

