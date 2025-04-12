import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { MoreHorizontal, Search, Trash2, RotateCcw, Eye, Pencil } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/Components/ui/dropdown-menu';
import { toast } from 'react-toastify';
import AdminLayout from '@/Layouts/AdminLayout';
import React from 'react';

export default function ClientsTrashed({ clients = { data: [] } }) {
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');

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
    
    if (debounced) {
      router.get(
        route('admin.clients.trashed'), 
        { search: debounced }, 
        { preserveState: true }
      );
    } else if (debounced === '' && search === '') {
      router.get(route('admin.clients.trashed'), {}, { preserveState: true });
    }
  }, [debounced]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleRestore = (id) => {
    if (confirm('Deseja restaurar este cliente?')) {
      router.put(route('admin.clients.restore', id), {}, {
        onSuccess: () => {
          toast.success('Cliente restaurado com sucesso!');
        },
        onError: () => {
          toast.error('Ocorreu um erro ao restaurar o cliente.');
        }
      });
    }
  };

  const handleForceDelete = (id) => {
    if (confirm('Tem certeza que deseja excluir permanentemente este cliente? Esta ação NÃO poderá ser desfeita.')) {
      router.delete(route('admin.clients.force-delete', id), {
        onSuccess: () => {
          toast.success('Cliente excluído permanentemente com sucesso!');
        },
        onError: () => {
          toast.error('Ocorreu um erro ao excluir permanentemente o cliente.');
        }
      });
    }
  };
  
  const goToActiveClients = () => {
    router.visit(route('admin.clients.index'));
  };

  // Verificar se clients e clients.data existem
  const hasClients = clients && clients.data && clients.data.length > 0;
  const clientsArray = clients?.data || [];

  return (
    <AdminLayout title="Clientes Excluídos">
      <Head title="Clientes Excluídos" />
      
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Clientes Excluídos</h2>
          <p className="text-muted-foreground">Gerencie clientes que foram temporariamente excluídos</p>
        </div>
        <Button onClick={goToActiveClients} variant="outline">
          Voltar para Clientes Ativos
        </Button>
      </div>
      
      <div className="mb-6 flex items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cliente..."
            className="pl-8"
            value={search}
            onChange={handleSearch}
          />
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Agência</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Data de Exclusão</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!hasClients && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  Nenhum cliente excluído encontrado.
                </TableCell>
              </TableRow>
            )}
            
            {clientsArray.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">
                  {client.name}
                  <div className="text-xs text-muted-foreground">{client.email}</div>
                </TableCell>
                <TableCell>
                  {client.agency ? client.agency.name : 'Nenhuma'}
                </TableCell>
                <TableCell>
                  {client.plan ? client.plan.name : 'Nenhum'}
                </TableCell>
                <TableCell>
                  {client.deleted_at ? format(parseISO(client.deleted_at), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
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
                      <DropdownMenuItem onClick={() => handleRestore(client.id)}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Restaurar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleForceDelete(client.id)} className="text-destructive focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir Permanentemente
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {clients.links && clients.links.length > 3 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {clients.links.map((link, i) => {
            // Ignorar os links "prev" e "next" que já são mostrados como setas
            if (link.label === "&laquo; Previous" || link.label === "Next &raquo;") return null;
            
            return (
              <Button 
                key={i}
                variant={link.active ? "default" : "outline"} 
                className="h-8 w-8 p-0"
                disabled={!link.url}
                onClick={() => router.get(link.url)}
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
} 