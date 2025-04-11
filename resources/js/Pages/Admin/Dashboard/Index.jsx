"use client";

import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { 
  Users, 
  Building2, 
  PackageOpen, 
  Settings, 
  Plug,
  FileText 
} from 'lucide-react';

export default function AdminDashboard({ auth }) {
  const dashboardItems = [
    { 
      title: 'Clientes',
      description: 'Gerencie todos os clientes da plataforma.', 
      href: route('admin.clients.index'),
      icon: <Users className="h-5 w-5" />,
      label: 'Ver clientes'
    },
    { 
      title: 'Agências',
      description: 'Gerencie as agências parceiras.', 
      href: route('admin.agencies.index'),
      icon: <Building2 className="h-5 w-5" />,
      label: 'Ver agências'
    },
    { 
      title: 'Planos',
      description: 'Configure planos da plataforma.', 
      href: route('admin.plans.index'),
      icon: <PackageOpen className="h-5 w-5" />,
      label: 'Gerenciar planos'
    },
    { 
      title: 'Integrações',
      description: 'Configure integrações da plataforma.', 
      href: route('admin.integrations.index'),
      icon: <Plug className="h-5 w-5" />,
      label: 'Gerenciar integrações'
    },
    { 
      title: 'Configurações',
      description: 'Configure a plataforma.', 
      href: route('admin.settings.index'),
      icon: <Settings className="h-5 w-5" />,
      label: 'Gerenciar configurações'
    },
    { 
      title: 'Logs',
      description: 'Visualize os logs do sistema.', 
      href: route('admin.settings.logs'),
      icon: <FileText className="h-5 w-5" />,
      label: 'Ver logs'
    }
  ];

  return (
    <AdminLayout title="Dashboard Administrativo">
      <Head title="Dashboard Administrativo" />
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Bem-vindo, {auth.user.name}!</h2>
        <p className="text-muted-foreground">Gerencie sua plataforma com facilidade</p>
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
    </AdminLayout>
  );
} 