import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import ClientForm from './Form';

export default function ClientCreate({ agencies, plans }) {
  return (
    <ClientForm
      agencies={agencies}
      plans={plans}
    />
  );
} 