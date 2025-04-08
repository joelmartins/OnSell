"use client";

import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AgencyForm from './Form';

export default function AgencyEdit({ auth, agency }) {
  return (
    <AdminLayout title={`Editar ${agency.name}`}>
      <Head title={`Editar ${agency.name}`} />
      
      <div className="mb-8 flex items-center">
        <Button variant="outline" size="sm" asChild className="mr-4">
          <Link href={route('admin.agencies.index')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-semibold">Editar Agência</h2>
          <p className="text-muted-foreground">Altere as informações da agência {agency.name}</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Informações da Agência</CardTitle>
          <CardDescription>
            Atualize os dados da agência conforme necessário.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AgencyForm agency={agency} isEditing={true} />
        </CardContent>
      </Card>
    </AdminLayout>
  );
} 