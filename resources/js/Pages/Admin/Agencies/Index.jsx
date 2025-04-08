"use client";

import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { 
  Plus, 
  Search, 
  Edit, 
  Eye,
  CheckCircle,
  XCircle,
  Trash,
  MoreHorizontal
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Link } from '@inertiajs/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { toast } from 'react-toastify';
import Pagination from '@/Components/Pagination';

export default function AgenciesIndex({ agencies, auth }) {
  const [search, setSearch] = useState('');
  
  // Filtrar agências com base na pesquisa (apenas no lado do cliente)
  const filteredAgencies = agencies.data.filter(agency => 
    agency.name.toLowerCase().includes(search.toLowerCase()) ||
    (agency.email && agency.email.toLowerCase().includes(search.toLowerCase())) ||
    (agency.domain && agency.domain.toLowerCase().includes(search.toLowerCase()))
  );

  const handleEdit = (id) => {
    router.visit(route('admin.agencies.edit', id));
  };

  const handleView = (id) => {
    router.visit(route('admin.agencies.show', id));
  };

  const handleToggleStatus = (id) => {
    router.put(route('admin.agencies.toggle-status', id), {}, {
      onSuccess: () => {
        toast.success('Status da agência alterado com sucesso!');
      },
      onError: () => {
        toast.error('Erro ao alterar status da agência!');
      }
    });
  };

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja excluir esta agência?')) {
      router.delete(route('admin.agencies.destroy', id), {
        onSuccess: () => {
          toast.success('Agência excluída com sucesso!');
        },
        onError: (errors) => {
          if (errors.error) {
            toast.error(errors.error);
          } else {
            toast.error('Erro ao excluir agência!');
          }
        }
      });
    }
  };

  const handleImpersonate = (id) => {
    router.visit(route('impersonate.agency', id));
  };

  return (
    <AdminLayout title="Gerenciamento de Agências">
      <Head title="Gerenciamento de Agências" />
      
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Agências</h2>
          <p className="text-muted-foreground">Gerencie todas as agências da plataforma</p>
        </div>
        <Button asChild>
          <Link href={route('admin.agencies.create')}>
            <Plus className="mr-2 h-4 w-4" /> Nova Agência
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Todas as Agências</CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar agências..."
                className="pl-8 w-full sm:w-64"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <CardDescription>
            Um total de {agencies.total} agências registradas na plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Domínio</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead className="text-center">Clientes</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAgencies.length > 0 ? (
                  filteredAgencies.map((agency) => (
                    <TableRow key={agency.id}>
                      <TableCell className="font-medium">{agency.name}</TableCell>
                      <TableCell>{agency.domain || '-'}</TableCell>
                      <TableCell>{agency.email || '-'}</TableCell>
                      <TableCell className="text-center">{agency.clients_count}</TableCell>
                      <TableCell className="text-center">
                        {agency.is_active ? (
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
                      <TableCell className="text-center">
                        {new Date(agency.created_at).toLocaleDateString('pt-BR')}
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
                            <DropdownMenuItem onClick={() => handleEdit(agency.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Editar</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleImpersonate(agency.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              <span>Acessar como</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(agency.id)}>
                              {agency.is_active ? (
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
                              onClick={() => handleDelete(agency.id)}
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
                    <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                      {search ? 'Nenhuma agência encontrada para a busca.' : 'Nenhuma agência encontrada.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {agencies.data.length > 0 && !search && (
            <div className="mt-4">
              <Pagination links={agencies.links} />
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
} 