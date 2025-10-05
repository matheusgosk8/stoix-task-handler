"use client";

import Link from "next/link";
import React from "react";


export const Success = ({message}:{message: string}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-6 shadow-lg max-w-sm text-center">
        <svg
          className="h-12 w-12 text-green-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <span className="text-gray-700 font-medium">{message || "Cadastro realizado com sucesso!"}</span>
        <Link href={'/login'}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Ir para Login
        </Link>
      </div>
    </div>
  );
};
