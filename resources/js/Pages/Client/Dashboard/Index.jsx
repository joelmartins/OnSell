"use client";

import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import ClientLayout from '@/Layouts/ClientLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Kanban, 
  MessageSquare, 
  Zap, 
  Users, 
  BarChart, 
  Plug, 
} from 'lucide-react';

export default function DashboardIndex({ auth }) {
  const dashboardItems = [
    { 
      title: 'Pipeline',
      description: 'Gerencie suas oportunidades de vendas.', 
      href: route('client.pipeline'),
      icon: <Kanban className="h-5 w-5" />,
      label: 'Acessar Pipeline'
    },
    { 
      title: 'Mensagens',
      description: 'Centralize suas comunicações com clientes.', 
      href: route('client.messages'),
      icon: <MessageSquare className="h-5 w-5" />,
      label: 'Ver Mensagens'
    },
    { 
      title: 'Automação',
      description: 'Configure fluxos de automação de vendas.', 
      href: route('client.automation'),
      icon: <Zap className="h-5 w-5" />,
      label: 'Configurar Automações'
    },
    { 
      title: 'Contatos',
      description: 'Gerencie sua base de contatos.', 
      href: route('client.contacts'),
      icon: <Users className="h-5 w-5" />,
      label: 'Ver Contatos'
    },
    { 
      title: 'Relatórios',
      description: 'Visualize o desempenho das suas vendas.', 
      href: route('client.reports'),
      icon: <BarChart className="h-5 w-5" />,
      label: 'Ver Relatórios'
    },
    { 
      title: 'Integrações',
      description: 'Configure integrações com outros serviços.', 
      href: route('client.integrations'),
      icon: <Plug className="h-5 w-5" />,
      label: 'Configurar Integrações'
    },
  ];

  return (
    <ClientLayout title="Dashboard">
      <Head title="Dashboard" />
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Bem-vindo, {auth.user.name}!</h2>
        <p className="text-muted-foreground">Gerencie suas vendas com eficiência</p>
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
    </ClientLayout>
  );
} 