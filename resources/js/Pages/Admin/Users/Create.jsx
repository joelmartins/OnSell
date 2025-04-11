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
} from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";

export default function Create({ clients, agencies }) {
  return (
    <AdminLayout>
      <Head title="Criar Usuário" />
      
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
          <CardTitle>Criar Novo Usuário</CardTitle>
          <CardDescription>Preencha os dados para criar um novo usuário no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm 
            clients={clients} 
            agencies={agencies} 
            isEditing={false} 
          />
        </CardContent>
      </Card>
    </AdminLayout>
  );
} 