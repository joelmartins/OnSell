import UserForm from './Form';
import AdminLayout from '@/Layouts/AdminLayout';
import { Link } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Edit({ user, clients, agencies, flash }) {
  return (
    <AdminLayout>
      <Head title={`Editar Usuário - ${user.name}`} />
      
      <div className="flex items-start mb-4">
        <Link
          href={route('admin.users.index')}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Voltar para Usuários</span>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Editar Usuário</CardTitle>
          <CardDescription>Atualize as informações do usuário {user.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm 
            user={user} 
            clients={clients} 
            agencies={agencies} 
            isEditing={true} 
            flash={flash}
          />
        </CardContent>
      </Card>
    </AdminLayout>
  );
} 