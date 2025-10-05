"use client"

import { Task } from '@/models/client'
import React, { useState } from 'react'
import TaskItem from '../task/Task'
import { FaTrash, FaTimes } from 'react-icons/fa'
import { useDeleteMultipleTasks } from '@/services/tasksActions'
import { Loading } from '../loading'
import { BsInboxes } from 'react-icons/bs'

type Props = {
    tasks: Task[]
}

const Tasks = ({ tasks }: Props) => {
    const [selectedTasks, setSelectedTasks] = useState<string[]>([])


    const handleSelectTask = (id: string) => {
        setSelectedTasks(prev =>
            prev.includes(id) ? prev.filter(taskId => taskId !== id) : [...prev, id]
        )
    }

    const handleDeselectAll = () => {
        setSelectedTasks([])
    }

    const deleteTasksMutation = useDeleteMultipleTasks(handleDeselectAll);

    const handleDeleteSelected = () => {

        deleteTasksMutation.mutate(selectedTasks);
    }

    return (
        <div className="flex flex-col w-full">

            {
                deleteTasksMutation.isPending &&
                <Loading />
            }

            {selectedTasks.length > 0 && (
                <div className="flex justify-between items-center bg-gray-200  py-2 rounded mb-4 px-5">
                    <span>{selectedTasks.length} tarefa(s) selecionada(s)</span>
                    <div className="flex gap-2">
                        <button
                            onClick={handleDeselectAll}
                            className="flex items-center gap-1 px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                        >
                            <FaTimes /> Deselecionar tudo
                        </button>
                        <button
                            onClick={handleDeleteSelected}
                            className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            <FaTrash /> Apagar selecionadas
                        </button>
                    </div>
                </div>
            )}

            <main className="flex-col w-full justify-center items-center py-8 ml-0 ">
                <div className="grid gap-4">
                    {tasks.length > 0 ? tasks?.map((task) => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            selectedTasks={selectedTasks}
                            onSelectTask={handleSelectTask}
                        />
                    ))
                        :
                        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                            <BsInboxes size={48} className="mb-4" />
                            <p className="text-lg font-medium">Nenhuma tarefa encontrada</p>
                            <p className="text-sm">Crie uma nova tarefa usando o botão acima</p>
                        </div>
                    }
                </div>
            </main>
        </div>
    )
}

export default Tasks
