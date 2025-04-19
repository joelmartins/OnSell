"use client";

import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import ClientLayout from '@/Layouts/ClientLayout';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/Components/ui/table';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  Upload, 
  MoreHorizontal,
  Trash2,
  Edit,
  Eye,
  ArrowUpDown,
  Mail,
  Phone,
  Clock
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import { toast } from 'react-toastify';
import axios from 'axios';

export default function ContactsIndex({ auth, contacts, sources, statuses, filters }) {
  const [searchTerm, setSearchTerm] = useState(filters?.search || '');
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [sourceFilter, setSourceFilter] = useState(filters?.source || 'all');
  const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');
  const [sortBy, setSortBy] = useState(filters?.sort_by || 'name');
  const [sortDirection, setSortDirection] = useState(filters?.sort_direction || 'asc');
  const [exporting, setExporting] = useState(false);

  // Gerenciar mudança de pesquisa com delay
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Limpar o timeout anterior
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Configurar um novo timeout
    setSearchTimeout(setTimeout(() => {
      applyFilters(statusFilter, sourceFilter, value, sortBy, sortDirection);
    }, 500));
  };

  // Aplicar filtros
  const applyFilters = (status, source, search, sort_by, sort_direction) => {
    setStatusFilter(status);
    setSourceFilter(source);
    setSortBy(sort_by);
    setSortDirection(sort_direction);
    
    try {
      const url = new URL(route('client.contacts.index'), window.location.origin);
      
      // Adicionar parâmetros de consulta
      if (search) url.searchParams.append('search', search);
      if (status !== 'all') url.searchParams.append('status', status);
      if (source !== 'all') url.searchParams.append('source', source);
      url.searchParams.append('sort_by', sort_by);
      url.searchParams.append('sort_direction', sort_direction);
      
      // Navegar para a URL construída
      window.location.href = url.toString();
    } catch (error) {
      console.error('Erro ao aplicar filtros:', error);
      window.location.reload();
    }
  };

  const handleSort = (column) => {
    const direction = sortBy === column && sortDirection === 'asc' ? 'desc' : 'asc';
    applyFilters(statusFilter, sourceFilter, searchTerm, column, direction);
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleDelete = (contact) => {
    if (window.confirm(`Tem certeza que deseja excluir o contato ${contact.name}?`)) {
      axios.delete(route('client.contacts.destroy', contact.id), {
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        }
      })
        .then(() => {
          toast.success('Contato excluído com sucesso!');
          window.location.href = route('client.contacts.index');
        })
        .catch(error => {
          console.error('Erro ao excluir contato:', error);
          toast.error('Erro ao excluir contato. Tente novamente ou contate o suporte.');
        });
    }
  };

  const exportContacts = () => {
    setExporting(true);
    
    // Construir a URL com os mesmos filtros aplicados na visualização atual
    let url = route('client.contacts.export');
    const params = new URLSearchParams();
    
    if (searchTerm) params.append('search', searchTerm);
    if (statusFilter !== 'all') params.append('status', statusFilter);
    if (sourceFilter !== 'all') params.append('source', sourceFilter);
    params.append('sort_by', sortBy);
    params.append('sort_direction', sortDirection);
    
    if (params.toString()) {
      url += '?' + params.toString();
    }
    
    // Abrir a URL em uma nova aba
    window.open(url, '_blank');
    setExporting(false);
  };

  return (
    <ClientLayout
      user={auth.user}
      header={
        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
          Contatos
        </h2>
      }
    >
      <Head title="Contatos" />

      <div className="py-6">
        <div className="px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl">Lista de Contatos</CardTitle>
                <div className="flex space-x-2">
                  <Link href={route('client.contacts.import')}>
                    <Button variant="outline" className="flex items-center gap-1">
                      <Upload className="h-4 w-4" />
                      Importar
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-1"
                    onClick={exportContacts}
                    disabled={exporting}
                  >
                    <Download className="h-4 w-4" />
                    {exporting ? 'Exportando...' : 'Exportar'}
                  </Button>
                  <Link href={route('client.contacts.create')}>
                    <Button className="flex items-center gap-1">
                      <Plus className="h-4 w-4" />
                      Novo Contato
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row mt-4 gap-2 items-center justify-between">
                <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
                  <Select value={statusFilter} onValueChange={(value) => applyFilters(value, sourceFilter, searchTerm, sortBy, sortDirection)}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      {statuses && statuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={sourceFilter} onValueChange={(value) => applyFilters(statusFilter, value, searchTerm, sortBy, sortDirection)}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Origem" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as origens</SelectItem>
                      {sources && sources.map((source) => (
                        <SelectItem key={source} value={source}>
                          {source}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar contatos..."
                    className="pl-8 w-full sm:w-64"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>
              
              <CardDescription>
                Um total de {contacts.total} contatos em sua base de dados.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead onClick={() => handleSort('name')} className="cursor-pointer">
                        <div className="flex items-center">
                          Nome
                          {sortBy === 'name' && (
                            <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                          )}
                        </div>
                      </TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead onClick={() => handleSort('company')} className="cursor-pointer hidden md:table-cell">
                        <div className="flex items-center">
                          Empresa
                          {sortBy === 'company' && (
                            <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">Status</TableHead>
                      <TableHead className="hidden md:table-cell">Origem</TableHead>
                      <TableHead onClick={() => handleSort('last_interaction_at')} className="cursor-pointer hidden lg:table-cell">
                        <div className="flex items-center">
                          Última Interação
                          {sortBy === 'last_interaction_at' && (
                            <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts.data.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          Nenhum contato encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      contacts.data.map((contact) => (
                        <TableRow key={contact.id}>
                          <TableCell className="font-medium">{contact.name}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {contact.email && (
                                <div className="flex items-center text-sm">
                                  <Mail className="h-3 w-3 mr-1" /> {contact.email}
                                </div>
                              )}
                              {contact.phone && (
                                <div className="flex items-center text-sm">
                                  <Phone className="h-3 w-3 mr-1" /> {contact.phone}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{contact.company || '-'}</TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {contact.status ? (
                              <Badge variant="outline" className="bg-slate-100">
                                {contact.status}
                              </Badge>
                            ) : '-'}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{contact.source || '-'}</TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {contact.last_interaction_at ? (
                              <div className="flex items-center text-sm">
                                <Clock className="h-3 w-3 mr-1" /> {formatDate(contact.last_interaction_at)}
                              </div>
                            ) : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                  <Link href={route('client.contacts.show', contact.id)}>
                                    <Eye className="h-4 w-4 mr-2" /> Ver detalhes
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={route('client.contacts.edit', contact.id)}>
                                    <Edit className="h-4 w-4 mr-2" /> Editar
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(contact)}>
                                  <Trash2 className="h-4 w-4 mr-2" /> Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* Paginação */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Exibindo {contacts.from || 0} a {contacts.to || 0} de {contacts.total} registros
                </div>
                <div className="flex items-center space-x-2">
                  {contacts.links.map((link, i) => (
                    <Link 
                      key={i}
                      href={link.url || '#'} 
                      className={`px-3 py-1 rounded text-sm ${link.active 
                        ? 'bg-primary text-white' 
                        : link.url 
                          ? 'bg-white hover:bg-gray-100 border' 
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                      preserveScroll
                    >
                      {link.label.replace('&laquo;', '«').replace('&raquo;', '»')}
                    </Link>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ClientLayout>
  );
} 