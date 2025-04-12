"use client";

import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import { Separator } from '@/Components/ui/separator';
import { ArrowLeft, Save } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function GoogleIntegration({ auth }) {
  return (
    <AdminLayout title="Configuração do Google Ads">
      <Head title="Configuração do Google Ads" />
      
      <div className="mb-8 flex items-center">
        <Button variant="outline" size="sm" asChild className="mr-4">
          <Link href={route('admin.integrations.index')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-semibold">Configuração do Google Ads</h2>
          <p className="text-muted-foreground">Configure a integração com a API do Google Ads</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Configurações do Google Ads</CardTitle>
          <CardDescription>
            Configure as credenciais e parâmetros para a API do Google Ads
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Este componente está em desenvolvimento. Retorne em breve para configurar a integração com Google Ads.</p>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button disabled>
            <Save className="mr-2 h-4 w-4" />
            Salvar Configurações
          </Button>
        </CardFooter>
      </Card>
    </AdminLayout>
  );
} 