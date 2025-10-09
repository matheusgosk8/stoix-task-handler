'use client';

import Header from '@/components/tasks/Header';
import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <Header />
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
}
