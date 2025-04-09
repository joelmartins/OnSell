import UserForm from './Form';
import AdminLayout from '@/Layouts/AdminLayout';
import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

export default function Edit({ user, clients, agencies, flash }) {
  return (
    <AdminLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center">
              <Link
                href={route('admin.users.index')}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Usuários
              </Link>
              <h1 className="ml-4 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Editar Usuário
              </h1>
            </div>
          </div>

          <UserForm 
            user={user} 
            clients={clients} 
            agencies={agencies} 
            isEditing={true} 
            flash={flash}
          />
        </div>
      </div>
    </AdminLayout>
  );
} 