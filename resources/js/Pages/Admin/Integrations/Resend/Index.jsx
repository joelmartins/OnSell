"use client";

import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import { Separator } from '@/Components/ui/separator';
import { ArrowLeft, Save } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function ResendIntegration({ auth }) {
  return (
    <AdminLayout title="Configuração do Resend">
      <Head title="Configuração do Resend" />
      
      <div className="mb-8 flex items-center">
        <Button variant="outline" size="sm" asChild className="mr-4">
          <Link href={route('admin.integrations.index')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-semibold">Configuração do Resend</h2>
          <p className="text-muted-foreground">Configure a integração com a API do Resend para email</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Configurações do Resend</CardTitle>
          <CardDescription>
            Configure as credenciais e parâmetros para a API do Resend
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Este componente está em desenvolvimento. Retorne em breve para configurar a integração com Resend.</p>
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