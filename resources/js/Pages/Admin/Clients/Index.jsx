import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Eye, MoreHorizontal, Pencil, Plus, Search, Trash, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import Pagination from '@/Components/Pagination';

export default function ClientsIndex({ clients }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClients = clients.data?.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleAdd = () => {
    router.visit(route('admin.clients.create'));
  };

  const handleEdit = (id) => {
    router.visit(route('admin.clients.edit', id));
  };

  const handleView = (id) => {
    router.visit(route('admin.clients.show', id));
  };

  const handleToggleStatus = (id) => {
    router.put(route('admin.clients.toggle-status', id), {}, {
      onSuccess: () => {
        toast.success('Status do cliente alterado com sucesso!');
      },
      onError: () => {
        toast.error('Erro ao alterar status do cliente!');
      }
    });
  };

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      router.delete(route('admin.clients.destroy', id), {
        onSuccess: () => {
          toast.success('Cliente excluído com sucesso!');
        },
        onError: (errors) => {
          if (errors.error) {
            toast.error(errors.error);
          } else {
            toast.error('Erro ao excluir cliente!');
          }
        }
      });
    }
  };

  return (
    <AdminLayout title="Clientes">
      <Head title="Clientes" />
      
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Clientes</h2>
          <p className="text-muted-foreground">Gerencie todos os clientes da plataforma</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Todos os Clientes</CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar cliente..."
                className="pl-8 w-full sm:w-64"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Agência</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Domínio</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{client.agency?.name || 'Cliente Direto'}</TableCell>
                      <TableCell>{client.plan?.name || 'Sem plano'}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          client.is_active 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        }`}>
                          {client.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </TableCell>
                      <TableCell>{client.domain || 'Sem domínio'}</TableCell>
                      <TableCell>
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
                            <DropdownMenuItem onClick={() => handleView(client.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              <span>Visualizar</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(client.id)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              <span>Editar</span>
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
                            <DropdownMenuItem onClick={() => handleDelete(client.id)} className="text-red-600 focus:text-red-600">
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
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      {searchQuery ? 'Nenhum cliente encontrado para a busca.' : 'Nenhum cliente cadastrado.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {clients.data?.length > 0 && !searchQuery && (
            <div className="mt-4">
              <Pagination links={clients.links} />
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
} 