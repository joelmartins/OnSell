"use client";

import { Head } from '@inertiajs/react';
import AgencyLayout from '@/Layouts/AgencyLayout';
import ClientForm from './Form';

export default function ClientEdit({ client, plans }) {
  return (
    <AgencyLayout title="Editar Cliente">
      <Head title={`Editar Cliente - ${client.name}`} />
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold">Editar Cliente</h2>
        <p className="text-muted-foreground">Atualize as informações do cliente</p>
      </div>
      
      <ClientForm client={client} plans={plans} mode="edit" />
    </AgencyLayout>
  );
} 