/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios'
import { store } from "@/lib/store";


export const authApi = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/",
    headers: {
      "Content-Type": "application/json",
    },
  });


export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/",
    headers: {
      "Content-Type": "application/json",
    },
  });

api.interceptors.request.use(
    (config) => {
      const state = store.getState();
      const token = state.auth.token;
  
      if (token) {
        if (config.headers?.set) {
          config.headers.set("Authorization", `Bearer ${token}`);
        } else {
          (config.headers as any)["Authorization"] = `Bearer ${token}`;
        }
      }
  
      return config;
    },
    (error) => Promise.reject(error)
  );