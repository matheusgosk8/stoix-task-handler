export type Task = {
    id: string;
    title: string;
    description: string;
    done: boolean;
  };
  

export interface NewTaskInput {
    title: string;
    description: string;
    userId?: string
}


