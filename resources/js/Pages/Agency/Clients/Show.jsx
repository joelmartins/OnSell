"use client";

import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import AgencyLayout from '@/Layouts/AgencyLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Separator } from '@/Components/ui/separator';
import { toast } from 'react-toastify';
import { Edit, ArrowLeft, LogIn, Trash } from 'lucide-react';

export default function ClientShow({ client }) {
  // Função para excluir o cliente
  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.')) {
      router.delete(route('agency.clients.destroy', client.id), {
        onSuccess: () => {
          toast.success('Cliente excluído com sucesso!');
          router.visit(route('agency.clients.index'));
        },
        onError: () => {
          toast.error('Ocorreu um erro ao excluir o cliente.');
        }
      });
    }
  };

  return (
    <AgencyLayout title={`Cliente - ${client.name}`}>
      <Head title={`Cliente - ${client.name}`} />
      
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{client.name}</h2>
          <p className="text-muted-foreground">Detalhes do cliente</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href={route('agency.clients.index')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <Button variant="default" asChild>
            <Link href={route('agency.clients.edit', client.id)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <Button variant="primary" asChild>
            <a href={route('impersonate.client', { client: client.id })} className="flex items-center">
              <LogIn className="mr-2 h-4 w-4" />
              Acessar como
            </a>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>Detalhes do cadastro do cliente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Nome</h3>
                  <p>{client.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                  <p>{client.email || 'Não informado'}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Telefone</h3>
                  <p>{client.phone || 'Não informado'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Documento</h3>
                  <p>{client.document || 'Não informado'}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Descrição</h3>
                <p>{client.description || 'Sem descrição'}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Data de Criação</h3>
                  <p>{new Date(client.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Última Atualização</h3>
                  <p>{new Date(client.updated_at).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Outras Informações ou Métricas podem ser adicionadas aqui */}
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span>Status do Cliente</span>
                {client.is_active ? (
                  <Badge variant="success">Ativo</Badge>
                ) : (
                  <Badge variant="destructive">Inativo</Badge>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Plano</CardTitle>
            </CardHeader>
            <CardContent>
              {client.plan ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Nome do Plano</span>
                    <span className="font-medium">{client.plan.name}</span>
                  </div>
                  {client.plan.price && (
                    <div className="flex items-center justify-between">
                      <span>Valor</span>
                      <span className="font-medium">
                        R$ {parseFloat(client.plan.price).toFixed(2)}/
                        {client.plan.period === 'monthly' ? 'mês' : 'ano'}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-muted-foreground">Sem plano associado</p>
              )}
            </CardContent>
          </Card>
          
          <Card className="border-destructive">
            <CardHeader className="text-destructive">
              <CardTitle>Zona de Perigo</CardTitle>
              <CardDescription>Ações irreversíveis</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="destructive" 
                className="w-full" 
                onClick={handleDelete}
              >
                <Trash className="mr-2 h-4 w-4" />
                Excluir Cliente
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AgencyLayout>
  );
} 