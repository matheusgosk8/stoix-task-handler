'use client'

import { useDeleteTask } from '@/services/tasksActions'
import React from 'react'

type Props = {
  taskId: string
  onClose: () => void
}

const DeleteTaskModal = ({ taskId, onClose }: Props) => {

    const deleteTaskMutation = useDeleteTask(onClose);


  const handleConfirm = () => {
    deleteTaskMutation.mutate(taskId);
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-80 shadow-lg">
        <h2 className="text-lg font-bold mb-4">Confirmar exclusão</h2>
        <p>Tem certeza que deseja apagar esta tarefa?</p>
        <div className="flex justify-end gap-2 mt-4">
          <button disabled={deleteTaskMutation.isPending} onClick={onClose} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">
          {deleteTaskMutation.isPending ?'Aguarde':'Cancelar'}
          </button>
          <button
            disabled={deleteTaskMutation.isPending} onClick={handleConfirm}
            className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
          >
            {deleteTaskMutation.isPending ?'Aguarde':'Apagar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteTaskModal
