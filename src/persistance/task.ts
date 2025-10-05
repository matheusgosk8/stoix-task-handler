import { db } from "@/config/db/database";
import { task } from "@/config/db/schema";
import { Task } from "@/models/client";
import { TaskInsert } from "@/models/server";
import { eq } from "drizzle-orm";



export const createTask = async (userId: string, data: TaskInsert) => {
  try {
    const result = await db.insert(task).values({
        title: data.title,
        description: data.description,
        userId
    }).returning();
    return result[0];
  } catch (error) {
    console.error("Erro ao criar tarefa:", error);
    return null;
  }
};



export const updateTask = async (id: string, data: Partial<Task>) => {
    try {
      const result = await db
        .update(task)
        .set({
          title: data.title,
          description: data.description,
          done: data.done,
        })
        .where(eq(task.id, id)) 
        .returning();
  
      return result[0] || null;
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error);
      return null;
    }
  };
  
  export const deleteTask = async (id: string) => {
    try {
      const result = await db
        .delete(task)
        .where(eq(task.id, id)) 
        .returning();
  
      return result[0] || null;
    } catch (error) {
      console.error("Erro ao deletar tarefa:", error);
      return null;
    }
  };