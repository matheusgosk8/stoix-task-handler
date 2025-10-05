"use client"

import NewTask from '@/components/tasks/NewTask'
import Tasks from '@/components/tasks/Tasks'
import { useTasks } from '@/hooks/useTasks'
import React, { useEffect } from 'react'
import TasksSkeleton from './TaskSkeleton'
import { toast } from 'sonner'
import { useRouter } from "next/navigation";
import { AxiosError } from 'axios'

const TasksPage = () => {
    const router = useRouter();

    const { data, isLoading, isError, error } = useTasks();

    useEffect(() => {
        if (isError) {
          // Checa se o erro é do tipo AxiosError com status 401
          const axiosError = error as AxiosError;
          const status = axiosError?.response?.status;
    
          if (status === 401) {
            toast.error("Você precisa estar logado para acessar essa página", { duration: 3000 });
            router.push("/login");
          }
        }
      }, [isError, error, router]);

    if(isError){
        toast.error("Erro ao conectar com o servidor!", {duration: 5000});
    }

    return (
        <div className='flex flex-col w-full px-20'>
            <div className='flex flex-row justify-between items-center w-full pt-5'>
                <h1 className="text-2xl font-bold mb-6 inline">Minhas Tarefas</h1>
                <NewTask />
            </div>
            {
                isLoading ?
                <TasksSkeleton/>
                : data ?
                <Tasks tasks={data || []} />
                :
                <></>
            }

        </div>
    )
}

export default TasksPage