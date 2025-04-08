"use client";

import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import PlanForm from './Form';

export default function PlanCreate({ auth }) {
  return (
    <AdminLayout title="Criar Novo Plano">
      <Head title="Criar Novo Plano" />
      
      <div className="mb-8 flex items-center">
        <Button variant="outline" size="sm" asChild className="mr-4">
          <Link href={route('admin.plans.index')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-semibold">Criar Novo Plano</h2>
          <p className="text-muted-foreground">Adicione um novo plano à plataforma</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Informações do Plano</CardTitle>
          <CardDescription>
            Preencha os dados para criar um novo plano.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlanForm />
        </CardContent>
      </Card>
    </AdminLayout>
  );
} 