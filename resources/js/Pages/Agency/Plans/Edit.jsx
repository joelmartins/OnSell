"use client";

import { Head } from '@inertiajs/react';
import PlanForm from './Form';
import AgencyLayout from '@/Layouts/AgencyLayout';
import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';

export default function Edit({ plan, features }) {
  return (
    <AgencyLayout>
      <Head title={`Editar Plano - ${plan.name}`} />
      
      <div className="flex items-start mb-4">
        <Link
          href={route('agency.plans.index')}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Voltar para Planos</span>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Editar Plano</CardTitle>
          <CardDescription>Atualize as informações do plano {plan.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <PlanForm 
            plan={plan}
            features={features}
            isEditing={true}
          />
        </CardContent>
      </Card>
    </AgencyLayout>
  );
} 