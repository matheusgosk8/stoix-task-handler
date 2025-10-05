import { useMutation, useQueryClient } from "@tanstack/react-query";
import { NewTaskInput } from "@/models/client";
import { toast } from "sonner";
import { api } from "./apiCalls";
import { AxiosError } from "axios";

export const useCreateTask = (onFinish?: ()=> void) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: NewTaskInput) => api.post("/task", payload),
    onSuccess: (response) => {
      toast.success(response?.data?.message || "Tarefa criada com sucesso!", { duration: 3000 });
      queryClient.invalidateQueries({queryKey: ["tasks"]});
      onFinish?.()
    },
    onError: (err) => {
        const error = err as AxiosError<{ message: string }>;
        const message = error.response?.data?.message || "Erro ao conectar com o servidor.";
        toast.error(message,{duration: 3000});
    },
  });

  return mutation;
};

export const useUpdateTask = (onFinish?: ()=> void) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: NewTaskInput) => api.put("/task", payload),
    onSuccess: (response) => {
      toast.success(response?.data?.message || "Tarefa atualizada com sucesso!", { duration: 3000 });
      queryClient.invalidateQueries({queryKey: ["tasks"]});
      onFinish?.()
    },
    onError: (err) => {
        const error = err as AxiosError<{ message: string }>;
        const message = error.response?.data?.message || "Erro ao conectar com o servidor.";
        toast.error(message,{duration: 3000});
    },
  });

  return mutation;
};

export const useDeleteTask = (onFinish?: ()=> void) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (taskid: string) => api.delete(`/task?taskid=${taskid}`),
    onSuccess: (response) => {
      toast.success(response?.data?.message || "Tarefa apagada com sucesso!", { duration: 3000 });
      queryClient.invalidateQueries({queryKey: ["tasks"]});
      onFinish?.()
    },
    onError: (err) => {
        const error = err as AxiosError<{ message: string }>;
        const message = error.response?.data?.message || "Erro ao conectar com o servidor.";
        toast.error(message,{duration: 3000});
    },
  });

  return mutation;
};

export const useDeleteMultipleTasks = (onFinish?: () => void) => {
    const queryClient = useQueryClient();
  
    const mutation = useMutation({
      mutationFn: (taskIds: string[]) => {
        const params = taskIds.map(id => `taskid=${id}`).join("&");
        return api.delete(`/task?${params}`);
      },
      onSuccess: (response) => {
        toast.success(response?.data?.message || "Tarefas apagadas com sucesso!", { duration: 3000 });
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        onFinish?.();
      },
      onError: (err) => {
        const error = err as AxiosError<{ message: string }>;
        const message = error.response?.data?.message || "Erro ao conectar com o servidor.";
        toast.error(message, { duration: 3000 });
      },
    });
  
    return mutation;
  };


