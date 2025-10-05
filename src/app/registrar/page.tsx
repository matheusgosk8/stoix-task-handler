"use client";

import { Loading } from "@/components/loading";
import { Success } from "@/components/register/Success";
import { authApi } from "@/services/apiCalls";
import { AxiosError } from "axios";
import React, { useState } from "react";
import { toast } from "sonner";

const RegisterPage = () => {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);
    const [successMessage, setSuccessMessage] = useState<string>('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const newErrors: string[] = [];

        if (username.trim() === "") newErrors.push("Username é obrigatório.");
        if (password.length < 6)
            newErrors.push("Senha deve ter pelo menos 6 caracteres.");
        if (password !== confirmPassword)
            newErrors.push("As senhas não coincidem.");

        if (newErrors.length > 0) {
            setErrors(newErrors);
            setLoading(false);
            return;
        }

        setErrors([]);

        const user = {
            username,
            password,
            confirmPassword
        }

        try {
            const res = await authApi.post('/register', user);
            setSuccessMessage(res?.data?.message);
            setSuccess(true)
        }catch (err) {
            const error = err as AxiosError<{ message: string }>;
            const message = error.response?.data?.message || "Erro ao conectar com o servidor.";
            setErrors([message]);
            toast.error(message,{duration: 3000});
          } 
        setLoading(false)
    };



  
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-500 from- via-blue-500 via- to-blue-500 to- p-6">

            {
                loading && <Loading/>
            }
            {
                success && <Success message={successMessage}/>
            }
            <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-6">Registrar-se</h1>

                {errors.length > 0 && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                        <ul className="list-disc list-inside">
                            {errors.map((err, i) => (
                                <li key={i}>{err}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <form onSubmit={handleRegister} className="flex flex-col gap-4">
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
                    <div>
                        <label className="block text-gray-700 mb-1">Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-1">Repetir Senha</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Registrar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;
