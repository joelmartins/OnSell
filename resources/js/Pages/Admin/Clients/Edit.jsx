import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import ClientForm from './Form';

export default function ClientEdit({ client, agencies, plans }) {
  return (
    <ClientForm
      client={client}
      agencies={agencies}
      plans={plans}
      isEditing={true}
    />
  );
} 