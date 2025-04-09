"use client";

import { Head, Link } from '@inertiajs/react';
import ClientLayout from '@/Layouts/ClientLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { UserCog } from 'lucide-react';

export default function SettingsIndex({ auth }) {
  return (
    <ClientLayout title="Configurações">
      <Head title="Configurações" />

      <div className="mb-8">
        <h2 className="text-2xl font-semibold">Configurações</h2>
        <p className="text-muted-foreground">Gerencie as configurações da sua conta</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              Perfil de Usuário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Atualize suas informações pessoais e senha de acesso.
            </p>
            <Button asChild className="w-full">
              <Link href={route('client.settings.profile')}>
                Editar Perfil
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Outras cards de configuração podem ser adicionados aqui */}
      </div>
    </ClientLayout>
  );
} 