import { db } from '@/config/db/database';
import { task } from '@/config/db/schema';
import { Task } from '@/models/client';
import { desc } from 'drizzle-orm';
import { eq } from "drizzle-orm";


export const getUserTasks = async (userId: string): Promise<Task[] | null> => {
  try {
    const tasksFromDb = await db
      .select()
      .from(task)
      .where(eq(task.userId, userId))
      .orderBy(desc(task.createdAt));

    const tasks: Task[] = tasksFromDb.map(t => ({
      id: t.id,
      userId: t.userId,
      title: t.title,
      description: t.description || '', 
      done: t.done ?? false,
      createdAt: t.createdAt || new Date(),
    }));

    return tasks;
  } catch (error) {
    console.error("Erro ao buscar tarefas do usuário:", error);
    return null;
  }
};
