"use client";

import React, { useEffect, useState } from "react";
import { BsPlus } from "react-icons/bs";
import { Loading } from "../loading";
import { useCreateTask } from "@/services/tasksActions";

const NewTask = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");

    const closeModal = () => {
        setError("");
        setTitle("");
        setDescription("");
        setIsOpen(false);
    }

    const createTaskMutation = useCreateTask(closeModal);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!title.trim()) {
            setError("O título é obrigatório!");
            return;
        }

        createTaskMutation.mutate({ title, description})


    };

 
    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex hover:opacity-85 items-center cursor-pointer gap-2 h-fit bg-white rounded-md px-4 py-1 border shadow-md hover:bg-gray-100 transition"
            >
                <BsPlus /> Criar tarefa
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
                        <button
                            onClick={closeModal}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
                        >
                            ✕
                        </button>

                        <h2 className="text-xl font-bold mb-4">Nova Tarefa</h2>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            {error && <p className="text-red-600 font-medium">{error}</p>}
                            <input
                                type="text"
                                placeholder="Título"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <textarea
                                placeholder="Descrição"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                type="submit"
                                className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition"
                                disabled={createTaskMutation.isPending}
                            >
                                {createTaskMutation.isPending ? "Criando..." : "Criar Tarefa"}
                            </button>
                        </form>
                    </div>

                    {createTaskMutation.isPending && <Loading />}
                </div>
            )}
        </>
    );
};

export default NewTask;
