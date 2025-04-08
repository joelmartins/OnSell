"use client";

import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AgencyForm from './Form';

export default function AgencyCreate({ auth }) {
  return (
    <AdminLayout title="Criar Nova Agência">
      <Head title="Criar Nova Agência" />
      
      <div className="mb-8 flex items-center">
        <Button variant="outline" size="sm" asChild className="mr-4">
          <Link href={route('admin.agencies.index')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-semibold">Criar Nova Agência</h2>
          <p className="text-muted-foreground">Adicione uma nova agência à plataforma</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Informações da Agência</CardTitle>
          <CardDescription>
            Preencha os dados para criar uma nova agência.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AgencyForm />
        </CardContent>
      </Card>
    </AdminLayout>
  );
} 