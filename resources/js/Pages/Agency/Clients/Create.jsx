"use client";

import { Head } from '@inertiajs/react';
import AgencyLayout from '@/Layouts/AgencyLayout';
import ClientForm from './Form';

export default function ClientCreate({ plans }) {
  return (
    <AgencyLayout title="Novo Cliente">
      <Head title="Novo Cliente" />
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold">Novo Cliente</h2>
        <p className="text-muted-foreground">Adicione um novo cliente à sua agência</p>
      </div>
      
      <ClientForm plans={plans} mode="create" />
    </AgencyLayout>
  );
} 