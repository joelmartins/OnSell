import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Separator } from '@/Components/ui/separator';
import { 
  ArrowLeft, 
  Edit, 
  CheckCircle,
  XCircle, 
  Building2, 
  Mail, 
  Phone, 
  FileText, 
  Globe,
  Tag
} from 'lucide-react';

export default function ClientShow({ client }) {
  return (
    <AdminLayout title={`Cliente: ${client.name}`}>
      <Head title={`Cliente: ${client.name}`} />
      
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="outline" size="sm" asChild className="mr-4">
            <Link href={route('admin.clients.index')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-semibold">{client.name}</h2>
            <p className="text-muted-foreground">
              Visualizando informações do cliente
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={route('admin.clients.edit', client.id)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar Cliente
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informações do Cliente</CardTitle>
            <CardDescription>Detalhes completos do cliente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-row items-center">
                <Badge 
                  className={`${
                    client.is_active 
                      ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                      : 'bg-red-100 text-red-800 hover:bg-red-100'
                  } flex items-center justify-center gap-1 px-3 py-1 text-sm`}
                >
                  {client.is_active ? (
                    <>
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>Ativo</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3.5 w-3.5" />
                      <span>Inativo</span>
                    </>
                  )}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Informações básicas</h3>
                  <Separator className="my-2" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Email: {client.email}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Telefone: {client.phone || 'Não informado'}</span>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">CNPJ/CPF: {client.document || 'Não informado'}</span>
                </div>
                
                <div>
                  <span className="text-sm">Descrição: {client.description || 'Sem descrição'}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Associações</h3>
                  <Separator className="my-2" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">
                      Agência: {client.agency ? client.agency.name : 'Cliente Direto'}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">
                      Plano: {client.plan ? client.plan.name : 'Sem plano'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Ações Adicionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => {
                // Salvar dados de impersonação para exibir o banner
                sessionStorage.setItem('impersonate.data', JSON.stringify({
                  id: client.id,
                  name: client.name,
                  type: 'client'
                }));
                
                // Usar visit em vez de Link para redirecionamentos
                router.visit(route('impersonate.client', { client: client.id }));
              }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 h-4 w-4"
                >
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                Acessar como Cliente
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
} 