"use client"

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center  p-6 bg-gradient-to-br from-cyan-500 from- via-blue-500 via- to-blue-500 to-">
      <div className="bg-white shadow-md rounded-lg p-10 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Bem-vindo ao Stoix Task Handler
        </h1>
        <p className="text-gray-600 mb-2">
          Gerencie suas tarefas nesta plataforma simples e interativa.
        </p>
        <small className="text-gray-400">
          É necessário cadastrar uma conta para utilizar esta plataforma.
        </small>

        <div className="mt-6 flex justify-center gap-4">
          <Link href="/registrar">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Registrar-se
            </button>
          </Link>
          <Link href="/login">
            <button className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">
              Log-in
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
