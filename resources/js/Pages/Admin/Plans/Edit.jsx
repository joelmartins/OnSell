"use client";

import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import PlanForm from './Form';

export default function PlanEdit({ auth, plan }) {
  return (
    <AdminLayout title={`Editar ${plan.name}`}>
      <Head title={`Editar ${plan.name}`} />
      
      <div className="mb-8 flex items-center">
        <Button variant="outline" size="sm" asChild className="mr-4">
          <Link href={route('admin.plans.index')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-semibold">Editar Plano</h2>
          <p className="text-muted-foreground">Altere as informações do plano {plan.name}</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Informações do Plano</CardTitle>
          <CardDescription>
            Atualize os dados do plano conforme necessário.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlanForm plan={plan} isEditing={true} />
        </CardContent>
      </Card>
    </AdminLayout>
  );
} 