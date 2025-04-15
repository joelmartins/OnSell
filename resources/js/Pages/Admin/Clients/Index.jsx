import { useState, useEffect } from 'react';
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
import { Eye, MoreHorizontal, Pencil, Plus, Search, Trash, CheckCircle, XCircle, LogIn, Trash2, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import Pagination from '@/Components/Pagination';
import React from 'react';
import InvoicesModal from '@/Components/InvoicesModal';

export default function ClientsIndex({ clients = { data: [] }, agencies = [], auth }) {
  const [search, setSearch] = useState('');
  const [agencyFilter, setAgencyFilter] = useState('');
  const [debounced, setDebounced] = useState('');
  const [showInvoices, setShowInvoices] = useState(false);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Usar uma ref para evitar a primeira execução
  const initialRender = React.useRef(true);
  
  useEffect(() => {
    // Pular a primeira renderização
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }
    
    if (debounced || agencyFilter) {
      router.get(
        route('admin.clients.index'), 
        { search: debounced, agency: agencyFilter }, 
        { preserveState: true }
      );
    } else if (debounced === '' && search === '' && !agencyFilter) {
      router.get(route('admin.clients.index'), {}, { preserveState: true });
    }
  }, [debounced, agencyFilter]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleAdd = () => {
    router.visit(route('admin.clients.create'));
  };

  const handleEdit = (id) => {
    router.get(route('admin.clients.edit', id));
  };

  const handleView = (id) => {
    router.get(route('admin.clients.show', id));
  };

  const handleToggleStatus = (id) => {
    router.put(route('admin.clients.toggle-status', id), {}, {
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
      router.delete(route('admin.clients.destroy', id), {
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

  const handleShowInvoices = async (client) => {
    setSelectedClient(client);
    setShowInvoices(true);
    setInvoicesLoading(true);
    setInvoices([]);
    try {
      const response = await fetch(route('admin.clients.invoices', { client: client.id }));
      const data = await response.json();
      if (data.invoices) {
        setInvoices(data.invoices);
      } else {
        toast.error('Nenhuma cobrança encontrada.');
      }
    } catch (e) {
      toast.error('Erro ao buscar cobranças.');
    } finally {
      setInvoicesLoading(false);
    }
  };

  // Verificar se clients e clients.data existem
  const hasClients = clients && clients.data && clients.data.length > 0;
  const clientsArray = clients?.data || [];

  return (
    <AdminLayout title="Clientes">
      <Head title="Clientes" />
      
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Clientes</h2>
          <p className="text-muted-foreground">Gerencie todos os clientes da plataforma</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
          <Button onClick={() => router.visit(route('admin.clients.trashed'))} variant="outline">
            <Trash2 className="mr-2 h-4 w-4" />
            Clientes Excluídos
          </Button>
        </div>
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
                value={search}
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
                  <TableHead>Assinatura</TableHead>
                  <TableHead>Domínio</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hasClients ? (
                  clientsArray.map((client) => (
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
                      <TableCell>
                        {client.subscription_status ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                            {client.subscription_status}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
                            Sem assinatura
                          </span>
                        )}
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
                            <DropdownMenuItem onClick={() => handleShowInvoices(client)}>
                              <FileText className="mr-2 h-4 w-4" />
                              <span>Ver cobranças</span>
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
                      {search ? 'Nenhum cliente encontrado para a busca.' : 'Nenhum cliente cadastrado.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {hasClients && !search && clients.links && (
            <div className="mt-4">
              <Pagination links={clients.links} />
            </div>
          )}
        </CardContent>
      </Card>

      <InvoicesModal
        open={showInvoices}
        onClose={() => setShowInvoices(false)}
        loading={invoicesLoading}
        invoices={invoices}
        title={selectedClient ? `Cobranças de ${selectedClient.name}` : 'Cobranças'}
      />
    </AdminLayout>
  );
} 