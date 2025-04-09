"use client";

import { Head } from '@inertiajs/react';
import PlanForm from './Form';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Link } from '@inertiajs/react';

export default function Edit({ auth, plan }) {
  return (
    <AdminLayout title={`Editar Plano: ${plan.name}`}>
      <Head title={`Editar Plano: ${plan.name}`} />
      
      <div className="mb-8 flex items-center">
        <Button variant="outline" size="sm" asChild className="mr-4">
          <Link href={route('admin.plans.index')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Planos
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Editar Plano</CardTitle>
          <CardDescription>
            Atualize as informações do plano "{plan.name}".
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlanForm plan={plan} isEditing={true} />
        </CardContent>
      </Card>
    </AdminLayout>
  );
} 