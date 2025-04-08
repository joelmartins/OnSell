"use client";

import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import AgencyLayout from '@/Layouts/AgencyLayout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from 'react-toastify';
import { 
  Search, 
  UserPlus, 
  Edit, 
  Eye, 
  MoreHorizontal, 
  XCircle, 
  CheckCircle,
  Trash,
  LogIn
} from 'lucide-react';
import Pagination from '@/Components/Pagination';

export default function ClientsIndex({ clients = { data: [] }, auth }) {
  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    setSearch(e.target.value);
    
    // Debounce the search with setTimeout
    const timeoutId = setTimeout(() => {
      router.get(
        route('agency.clients.index'), 
        { search: e.target.value }, 
        { preserveState: true, preserveScroll: true }
      );
    }, 300);
    
    return () => clearTimeout(timeoutId);
  };

  const handleEdit = (id) => {
    router.visit(route('agency.clients.edit', id));
  };

  const handleView = (id) => {
    router.visit(route('agency.clients.show', id));
  };

  const handleToggleStatus = (id) => {
    router.put(route('agency.clients.toggle-status', id), {}, {
      onSuccess: () => {
        toast.success('Status do cliente atualizado com sucesso!');
      },
      onError: () => {
        toast.error('Ocorreu um erro ao atualizar o status do cliente.');
      }
    });
  };

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.')) {
      router.delete(route('agency.clients.destroy', id), {
        onSuccess: () => {
          toast.success('Cliente excluído com sucesso!');
        },
        onError: () => {
          toast.error('Ocorreu um erro ao excluir o cliente.');
        }
      });
    }
  };
  
  const handleImpersonate = (id) => {
    // Verificar se clients e clients.data existem
    if (!clients || !clients.data) return;
    
    // Salvar dados de impersonação para exibir o banner
    const client = clients.data.find(c => c.id === id);
    if (client) {
      sessionStorage.setItem('impersonate.data', JSON.stringify({
        id: client.id,
        name: client.name,
        type: 'client'
      }));
    }
    
    // Usar visit em vez de get para redirecionamentos
    router.visit(route('impersonate.client', { client: id }));
  };

  // Verificar se clients e clients.data existem
  const hasClients = clients && clients.data && clients.data.length > 0;
  const clientsArray = clients?.data || [];

  return (
    <AgencyLayout title="Clientes">
      <Head title="Clientes" />
      
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
          <div>
            <CardTitle>Clientes</CardTitle>
            <CardDescription>Gerencie os clientes da sua agência</CardDescription>
          </div>
          <Button onClick={() => router.visit(route('agency.clients.create'))}>
            <UserPlus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar cliente..."
                className="pl-8 w-full sm:w-64"
                value={search}
                onChange={handleSearch}
              />
            </div>
          </div>
          
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hasClients ? (
                  clientsArray.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{client.plan?.name || 'Sem plano'}</TableCell>
                      <TableCell className="text-center">
                        {client.is_active ? (
                          <Badge variant="success">Ativo</Badge>
                        ) : (
                          <Badge variant="destructive">Inativo</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {new Date(client.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEdit(client.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Editar</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleView(client.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              <span>Visualizar</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleImpersonate(client.id)}>
                              <LogIn className="mr-2 h-4 w-4" />
                              <span>Acessar como</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(client.id)}>
                              {client.is_active ? (
                                <>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  <span>Desativar</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  <span>Ativar</span>
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(client.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              <span>Excluir</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      {search ? 'Nenhum cliente encontrado para a busca.' : 'Nenhum cliente cadastrado.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {hasClients && clients.links && (
            <div className="mt-4">
              <Pagination links={clients.links} />
            </div>
          )}
        </CardContent>
      </Card>
    </AgencyLayout>
  );
} 