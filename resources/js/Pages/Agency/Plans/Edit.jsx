"use client";

import { Head } from '@inertiajs/react';
import AgencyPlanForm from './Form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/Components/ui/breadcrumb';
import { HomeIcon } from 'lucide-react';

export default function Edit({ plan }) {
  return (
    <>
      <Head title="Editar Plano" />
      
      <div className="container mx-auto py-6">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={route('agency.dashboard')}>
                <HomeIcon className="h-4 w-4 mr-1" />
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={route('agency.plans.index')}>
                Planos
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>
                Editar Plano
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <Card>
          <CardHeader>
            <CardTitle>Editar Plano</CardTitle>
            <CardDescription>
              Atualize as informações do plano "{plan.name}".
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AgencyPlanForm plan={plan} isEditing={true} />
          </CardContent>
        </Card>
      </div>
    </>
  );
} 