import { useQuery } from "@tanstack/react-query";
import { Task } from "@/models/client";
import { api } from "@/services/apiCalls";

export const useTasks = () => {
  return useQuery<Task[], Error>({
    queryKey: ["tasks"],
    queryFn: async () => {
      const res = await api.get("/task");
      return res?.data?.tasks as Task[];
    },
  });
};
