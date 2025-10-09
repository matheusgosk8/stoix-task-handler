"use client";

import React, { useState } from "react";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { authApi } from "@/services/apiCalls";
import { Loading } from "@/components/loading";
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { loginSuccess } from "@/lib/features/authSlice";
import { toast } from "sonner";
import type { AxiosError } from 'axios';


const LoginPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const newErrors: string[] = [];

    if (!username.trim()) newErrors.push("Username é obrigatório.");
    if (!password) newErrors.push("Senha é obrigatória.");

    if (newErrors.length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    setErrors([]);

    try {
      const res = await authApi.post("/login", { username, password });
      if (res.status !== 200) {
        setErrors([res?.data?.message || "Erro ao logar"]);
      } else {
        const user = res?.data?.user;
        dispatch(loginSuccess(user));
        toast.success(res?.data?.message || 'Login realizado com sucesso!');
        router.push('/tarefas')
      }
    }catch (err) {
      const error = err as AxiosError<{ message: string }>;
      const message = error.response?.data?.message || "Erro ao conectar com o servidor.";
      setErrors([message]);
      toast.error(message,{duration: 3000});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-black min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-500 from- via-blue-500 via- to-blue-500 to-  p-6">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Login</h1>

        {errors.length > 0 && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            <ul className="list-disc list-inside">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="relative">
            <label className="block text-gray-700 mb-1">Senha</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              required
            />
            <span
              className="absolute right-3 top-9 cursor-pointer text-gray-500"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <AiFillEyeInvisible size={20} /> : <AiFillEye size={20} />}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer"
          >
            Login
          </button>
        </form>
      </div>

      {
        loading && <Loading/>
      }
    </div>
  );
};

export default LoginPage;
