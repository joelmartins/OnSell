"use client";

import { Head } from '@inertiajs/react';
import ClientLayout from '@/Layouts/ClientLayout';

export default function IntegrationsIndex({ auth }) {
  return (
    <ClientLayout
      user={auth.user}
      header={
        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
          Integrações
        </h2>
      }
    >
      <Head title="Integrações" />

      <div className="py-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900">
              Conteúdo de Integrações
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
} 