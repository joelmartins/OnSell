"use client";

import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import AgencyLayout from '@/Layouts/AgencyLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { 
  Users, 
  Palette, 
  PackageOpen, 
  Settings 
} from 'lucide-react';

export default function AgencyDashboard({ auth }) {
  const dashboardItems = [
    { 
      title: 'Clientes',
      description: 'Gerencie todos os seus clientes.', 
      href: route('agency.clients.index'),
      icon: <Users className="h-5 w-5" />,
      label: 'Ver clientes'
    },
    { 
      title: 'White Label',
      description: 'Personalize a aparência da plataforma.', 
      href: route('agency.branding.index'),
      icon: <Palette className="h-5 w-5" />,
      label: 'Personalizar'
    },
    { 
      title: 'Planos',
      description: 'Configure planos para seus clientes.', 
      href: route('agency.plans.index'),
      icon: <PackageOpen className="h-5 w-5" />,
      label: 'Gerenciar planos'
    },
    { 
      title: 'Configurações',
      description: 'Configure sua agência.', 
      href: route('agency.settings.index'),
      icon: <Settings className="h-5 w-5" />,
      label: 'Gerenciar configurações'
    }
  ];

  return (
    <AgencyLayout title="Dashboard da Agência">
      <Head title="Dashboard da Agência" />
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Bem-vindo, {auth?.user?.name || 'Usuário'}!</h2>
        <p className="text-muted-foreground">Gerencie sua agência com facilidade</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardItems.map((item, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">{item.title}</CardTitle>
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                {item.icon}
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mt-2 mb-5">{item.description}</CardDescription>
              <Button asChild variant="outline" className="w-full">
                <Link href={item.href}>
                  {item.label}
                  <span className="sr-only">{item.title}</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </AgencyLayout>
  );
} 