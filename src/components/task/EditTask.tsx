'use client'

import React, { useState, useEffect } from 'react'
import { Task } from '@/models/client'
import { useUpdateTask } from '@/services/tasksActions'

type Props = {
  task: Task
  onClose: () => void
  onSave?: (updatedTask: Task) => void
}

const EditTaskModal = ({ task, onClose }: Props) => {
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description)
  const [done, setDone] = useState(task.done)
  
  const updateTaskMutation = useUpdateTask(onClose)


  useEffect(() => {
    setTitle(task.title)
    setDescription(task.description)
    setDone(task.done)
  }, [task])

  const handleSave = () => {
    const updatedTask: Task = { ...task, title, description, done }
    updateTaskMutation.mutate(updatedTask);
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
        <h2 className="text-lg font-bold mb-4">Editar Tarefa</h2>
        <input
          type="text"
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded mb-3"
        />
        <textarea
          placeholder="Descrição"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded mb-3"
        />
        <div className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            checked={done}
            onChange={(e) => setDone(e.target.checked)}
          />
          <span>Concluída</span>
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">
            Cancelar
          </button>
          <button disabled={updateTaskMutation.isPending} onClick={handleSave} className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600">
           {updateTaskMutation.isPending
            ?'Aguarde':'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditTaskModal
