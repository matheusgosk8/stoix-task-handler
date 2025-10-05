"use client";

import { Task } from "@/models/client";
import React, { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import EditTaskModal from "./EditTask";
import DeleteTaskModal from "./DeleteTask";
import { useUpdateTask } from "@/services/tasksActions";

type Props = {
  task: Task;
  selectedTasks: string[];
  onSelectTask: (id: string, checked: boolean) => void;
};

const TaskItem = ({ task, selectedTasks, onSelectTask }: Props) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const updateTaskMutation = useUpdateTask();

  const handleToggleDone = (task: Task) => {
    const data = { ...task, done: !task.done };
    updateTaskMutation.mutate(data);
  };

  const handleEditClick = () => setIsEditModalOpen(true);
  const handleDeleteClick = () => setIsDeleteModalOpen(true);

  const isSelected = selectedTasks?.includes(task.id);
  const isUpdating = updateTaskMutation.isPending;

  return (
    <div className="bg-white shadow rounded-lg flex justify-between items-center px-5 py-3">
      {/* Checkbox de seleção */}
      <input
        type="checkbox"
        checked={isSelected}
        onChange={(e) => onSelectTask(task.id, e.target.checked)}
        className="mr-4 mt-1"
      />

      <div className="flex-1">
        <h3 className={`text-lg font-bold ${task.done ? "line-through text-gray-500" : ""}`}>
          {task.title}
        </h3>
        <p className={`text-gray-600 ${task.done ? "line-through text-gray-400" : ""}`}>
          {task.description}
        </p>
      </div>

      <div className="flex gap-2 items-center">
        {/* Botão Fazer/Feito com spinner */}
        <button
          onClick={() => handleToggleDone(task)}
          disabled={isUpdating}
          className={`flex cursor-pointer hover:opacity-85 transition-opacity items-center justify-center w-[80px] h-9 rounded text-sm font-medium  
          ${task.done ? "bg-green-500 text-white" : "bg-gray-200 hover:bg-gray-300"}
          ${isUpdating ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {isUpdating ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            task.done ? "Feito" : "Fazer"
          )}
        </button>

        {/* Botões de editar/deletar padronizados */}
        <button
          onClick={handleEditClick}
          className="w-9 h-9 flex items-center justify-center border border-gray-500 bg-white rounded-sm hover:bg-black hover:text-white transition-colors cursor-pointer"
        >
          <FaEdit size={14} />
        </button>

        <button
          onClick={handleDeleteClick}
          className="w-9 h-9 flex items-center justify-center border border-gray-500 bg-white rounded-sm hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
        >
          <FaTrash size={14} />
        </button>
      </div>

      {/* Modais */}
      {isEditModalOpen && (
        <EditTaskModal task={task} onClose={() => setIsEditModalOpen(false)} />
      )}
      {isDeleteModalOpen && (
        <DeleteTaskModal taskId={task.id} onClose={() => setIsDeleteModalOpen(false)} />
      )}
    </div>
  );
};

export default TaskItem;
