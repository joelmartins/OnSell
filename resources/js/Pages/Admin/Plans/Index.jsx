"use client";

import { useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { 
  Plus, 
  Search, 
  Edit, 
  Copy,
  CheckCircle,
  XCircle,
  Users,
  Database,
  MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Link } from '@inertiajs/react';

export default function PlansIndex({ auth }) {
  const [search, setSearch] = useState('');
  
  // Dados de exemplo para planos
  const plans = [
    { 
      id: 1, 
      name: 'Starter', 
      description: 'Plano para pequenas empresas com necessidades básicas',
      price: 'R$ 97,00',
      is_active: true,
      features: {
        leads: 500,
        pipelines: 1,
        integrations: 1,
        users: 2
      },
      created_at: '2025-01-10'
    },
    { 
      id: 2, 
      name: 'Pro', 
      description: 'Para empresas em crescimento que precisam de mais recursos',
      price: 'R$ 197,00',
      is_active: true,
      features: {
        leads: 2000,
        pipelines: 3,
        integrations: 3,
        users: 5
      },
      created_at: '2025-01-10'
    },
    { 
      id: 3, 
      name: 'Enterprise', 
      description: 'Solução completa para empresas consolidadas',
      price: 'R$ 497,00',
      is_active: true,
      features: {
        leads: 10000,
        pipelines: 10,
        integrations: 10,
        users: 20
      },
      created_at: '2025-01-10'
    },
    { 
      id: 4, 
      name: 'Personalizado (Agência Premium)', 
      description: 'Plano personalizado para Agência Digital Suprema',
      price: 'R$ 399,00',
      is_active: true,
      features: {
        leads: 5000,
        pipelines: 5,
        integrations: 5,
        users: 10
      },
      created_at: '2025-03-15'
    },
    { 
      id: 5, 
      name: 'Básico (Descontinuado)', 
      description: 'Versão antiga do plano Starter',
      price: 'R$ 79,00',
      is_active: false,
      features: {
        leads: 300,
        pipelines: 1,
        integrations: 1,
        users: 1
      },
      created_at: '2025-01-01'
    },
  ];

  // Filtrar planos com base na pesquisa
  const filteredPlans = plans.filter(plan => 
    plan.name.toLowerCase().includes(search.toLowerCase()) ||
    plan.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Gerenciamento de Planos">
      <Head title="Gerenciamento de Planos" />
      
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Planos</h2>
          <p className="text-muted-foreground">Gerencie os planos disponíveis na plataforma</p>
        </div>
        <Button asChild>
          <Link href={route('admin.plans.create')}>
            <Plus className="mr-2 h-4 w-4" /> Novo Plano
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Todos os Planos</CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar planos..."
                className="pl-8 w-full sm:w-64"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <CardDescription>
            Um total de {plans.length} planos configurados na plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead className="text-center">Leads</TableHead>
                  <TableHead className="text-center">Pipelines</TableHead>
                  <TableHead className="text-center">Usuários</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlans.length > 0 ? (
                  filteredPlans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{plan.name}</p>
                          <p className="text-xs text-muted-foreground">{plan.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>{plan.price}/mês</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Database className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{plan.features.leads.toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{plan.features.pipelines}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{plan.features.users}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {plan.is_active ? (
                          <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-100 flex items-center justify-center gap-1">
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span>Ativo</span>
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100 flex items-center justify-center gap-1">
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Inativo</span>
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" asChild>
                            <Link href={route('admin.plans.edit', plan.id)}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Link>
                          </Button>
                          <Button variant="outline" size="icon" asChild>
                            <Link href={route('admin.plans.duplicate', plan.id)}>
                              <Copy className="h-4 w-4" />
                              <span className="sr-only">Duplicar</span>
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                      Nenhum plano encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
} 