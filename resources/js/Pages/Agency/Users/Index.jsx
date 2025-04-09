"use client";

import { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AgencyLayout from '@/Layouts/AgencyLayout';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/Components/ui/table';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { 
  CheckCircle, 
  MailCheck, 
  AlertTriangle, 
  MoreHorizontal,
  Power, 
  PowerOff,
  Search,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  UserX
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { toast } from 'react-toastify';

export default function Index({ auth, users }) {
  const { post, put, processing } = useForm();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Iniciar pesquisa com atraso para evitar muitas requisições
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Limpar o timeout anterior
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Configurar um novo timeout
    setSearchTimeout(setTimeout(() => {
      router.get(route('agency.users.index'), {
        search: value,
        role: filterRole !== 'all' ? filterRole : null,
        status: filterStatus !== 'all' ? filterStatus : null
      }, {
        preserveState: true,
        replace: true
      });
    }, 500));
  };

  // Aplicar filtros
  const applyFilters = (role, status) => {
    setFilterRole(role);
    setFilterStatus(status);
    
    router.get(route('agency.users.index'), {
      search: searchTerm,
      role: role !== 'all' ? role : null,
      status: status !== 'all' ? status : null
    }, {
      preserveState: true,
      replace: true
    });
  };

  const verifyEmail = (user) => {
    if (window.confirm(`Confirma a verificação manual do e-mail para ${user.name}?`)) {
      post(route('agency.users.verify-email', user.id), {
        onSuccess: () => {
          toast.success('E-mail verificado com sucesso!');
        },
      });
    }
  };

  const toggleStatus = (user) => {
    const action = user.is_active ? 'desativar' : 'ativar';
    if (window.confirm(`Confirma ${action} o usuário ${user.name}?`)) {
      put(route('agency.users.toggle-status', user.id), {
        onSuccess: () => {
          toast.success(`Usuário ${action === 'ativar' ? 'ativado' : 'desativado'} com sucesso!`);
        },
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Não verificado';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getRoleBadge = (roles) => {
    if (roles.includes('agency.owner')) {
      return <Badge className="bg-blue-600">Admin da Agência</Badge>;
    } else if (roles.includes('client.user') || roles.includes('client.owner')) {
      return <Badge className="bg-green-600">Cliente</Badge>;
    }
    return <Badge className="bg-gray-500">Sem papel</Badge>;
  };

  return (
    <AgencyLayout
      user={auth.user}
      header={
        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
          Gerenciamento de Usuários
        </h2>
      }
    >
      <Head title="Usuários" />

      <div className="py-6">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Barra de ferramentas */}
          <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg mb-6 p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Campo de pesquisa */}
              <div className="relative md:col-span-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  type="search"
                  placeholder="Buscar por nome, e-mail ou cliente..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-9"
                />
              </div>
              
              {/* Filtro por papel */}
              <div>
                <select
                  value={filterRole}
                  onChange={(e) => applyFilters(e.target.value, filterStatus)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">Todos os papéis</option>
                  <option value="agency.owner">Agência</option>
                  <option value="client.user">Cliente</option>
                </select>
              </div>
              
              {/* Filtro por status */}
              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => applyFilters(filterRole, e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">Todos os status</option>
                  <option value="active">Ativos</option>
                  <option value="inactive">Inativos</option>
                  <option value="unverified">Não verificados</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900">
              <Table>
                <TableCaption>Usuários da sua agência e clientes</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Papel</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Verificado em</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.data.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <UserX className="h-12 w-12 mb-2 opacity-50" />
                          <p>Nenhum usuário encontrado com os filtros aplicados</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  
                  {users.data.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.roles)}</TableCell>
                      <TableCell>
                        {user.client ? (
                          <span className="text-green-600">{user.client.name}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.email_verified_at ? (
                          <span className="flex items-center text-green-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            {formatDate(user.email_verified_at)}
                          </span>
                        ) : (
                          <span className="flex items-center text-amber-600">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Pendente
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.is_active ? (
                          <Badge className="bg-green-600">Ativo</Badge>
                        ) : (
                          <Badge className="bg-red-600">Inativo</Badge>
                        )}
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
                            
                            {!user.email_verified_at && (
                              <DropdownMenuItem 
                                onClick={() => verifyEmail(user)}
                                disabled={processing}
                              >
                                <MailCheck className="mr-2 h-4 w-4" />
                                <span>Verificar e-mail</span>
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuItem 
                              onClick={() => toggleStatus(user)}
                              disabled={processing}
                            >
                              {user.is_active ? (
                                <>
                                  <PowerOff className="mr-2 h-4 w-4" />
                                  <span>Desativar</span>
                                </>
                              ) : (
                                <>
                                  <Power className="mr-2 h-4 w-4" />
                                  <span>Ativar</span>
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Paginação */}
              {users.links && users.links.length > 3 && (
                <div className="flex items-center justify-between px-2 py-4 border-t">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500">
                      Mostrando {users.from} a {users.to} de {users.total} usuários
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {users.links.map((link, i) => {
                      // Pular os links "Anterior" e "Próximo" pois serão tratados separadamente
                      if (i === 0 || i === users.links.length - 1) return null;
                      
                      return (
                        <Button
                          key={i}
                          variant={link.active ? "default" : "outline"}
                          size="sm"
                          onClick={() => link.url && router.visit(link.url)}
                          disabled={!link.url}
                          className={!link.url ? "opacity-50 cursor-not-allowed" : ""}
                        >
                          {link.label.replace('&laquo;', '').replace('&raquo;', '')}
                        </Button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => users.prev_page_url && router.visit(users.prev_page_url)}
                      disabled={!users.prev_page_url}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => users.next_page_url && router.visit(users.next_page_url)}
                      disabled={!users.next_page_url}
                    >
                      Próximo
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AgencyLayout>
  );
} 