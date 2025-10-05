
export interface ErrorPayload {
    error?: string;
    message: string;
    code?: number;
}

export type RegisterResponse ={
    message: string;
    token?: string
}

export type TasksResponse ={
    message: string,
    tasks?: Task[]
}


export interface LogInApiResponse{
    message: string,
    user:{
        id: string;
        username: string,
        token: string
    }
}

export interface UserBody {
    username: string;
    password: string,
    confirmPassword: string
}

export interface User {
    username: string;
    password: string,
    id: string
}

export interface Task{
    id: string;
    title: string;
    done: boolean;
    description?: string
}

export interface TaskInsert {
    title: string,
    description?: string
}