"use client";

import { useState, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
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
  UserX,
  Pencil,
  Key,
  Plus
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

export default function Index({ auth, users, filters, flash }) {
  const { post, put, processing } = useForm();
  const [searchTerm, setSearchTerm] = useState(filters?.search || '');
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [filterRole, setFilterRole] = useState(filters?.role || 'all');
  const [filterStatus, setFilterStatus] = useState(filters?.status || 'all');

  // Verificar se há mensagem de senha gerada para exibir
  useEffect(() => {
    if (flash && flash.password_generated) {
      try {
        // Salvar a senha gerada no sessionStorage para exibição na página de edição
        sessionStorage.setItem('password_generated', JSON.stringify(flash.password_generated));
        toast.success(flash.password_generated.message || 'Nova senha gerada com sucesso!');
        
        // Redirecionar para a página de edição do usuário para exibir a senha gerada
        if (flash.password_generated.user_id) {
          // Use window.location.href em vez de router.visit para evitar problemas com versão
          window.location.href = route('admin.users.edit', flash.password_generated.user_id);
        }
      } catch (error) {
        console.error('Erro ao processar dados da senha:', error);
        toast.success('Nova senha gerada com sucesso!');
      }
    }
  }, [flash]);

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
      try {
        const url = new URL(route('admin.users.index'), window.location.origin);
        
        // Adicionar parâmetros de consulta
        if (value) url.searchParams.append('search', value);
        if (filterRole !== 'all') url.searchParams.append('role', filterRole);
        if (filterStatus !== 'all') url.searchParams.append('status', filterStatus);
        
        // Navegar para a URL construída
        window.location.href = url.toString();
      } catch (error) {
        console.error('Erro ao navegar:', error);
        window.location.reload();
      }
    }, 500));
  };

  // Aplicar filtros
  const applyFilters = (role, status) => {
    setFilterRole(role);
    setFilterStatus(status);
    
    try {
      const url = new URL(route('admin.users.index'), window.location.origin);
      
      // Adicionar parâmetros de consulta
      if (searchTerm) url.searchParams.append('search', searchTerm);
      if (role !== 'all') url.searchParams.append('role', role);
      if (status !== 'all') url.searchParams.append('status', status);
      
      // Navegar para a URL construída
      window.location.href = url.toString();
    } catch (error) {
      console.error('Erro ao aplicar filtros:', error);
      window.location.reload();
    }
  };

  const verifyEmail = (user) => {
    if (window.confirm(`Confirma a verificação manual do e-mail para ${user.name}?`)) {
      post(route('admin.users.verify-email', user.id), {
        onSuccess: () => {
          toast.success('E-mail verificado com sucesso!');
        },
      });
    }
  };

  const toggleStatus = (user) => {
    const action = user.is_active ? 'desativar' : 'ativar';
    if (window.confirm(`Confirma ${action} o usuário ${user.name}?`)) {
      put(route('admin.users.toggle-status', user.id), {
        onSuccess: () => {
          toast.success(`Usuário ${action === 'ativar' ? 'ativado' : 'desativado'} com sucesso!`);
        },
      });
    }
  };

  const handleDelete = (user) => {
    if (window.confirm(`Tem certeza que deseja excluir o usuário ${user.name}?`)) {
      post(route('admin.users.destroy', user.id), {
        method: 'delete',
        onSuccess: () => {
          toast.success('Usuário excluído com sucesso!');
        },
        onError: () => {
          toast.error('Erro ao excluir usuário.');
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
    if (roles.includes('admin.super')) {
      return <Badge className="bg-purple-600">Administrador</Badge>;
    } else if (roles.includes('agency.owner')) {
      return <Badge className="bg-blue-600">Agência</Badge>;
    } else if (roles.includes('client.user') || roles.includes('client.owner')) {
      return <Badge className="bg-green-600">Cliente</Badge>;
    }
    return <Badge className="bg-gray-500">Sem papel</Badge>;
  };

  const generateUserPassword = (user) => {
    if (window.confirm(`Deseja realmente gerar uma nova senha para ${user.name}?`)) {
      post(route('admin.users.generate-password', user.id), {
        onSuccess: (page) => {
          // A manipulação da resposta é tratada no useEffect que monitora flash
          if (!(page.props.flash && page.props.flash.password_generated)) {
            toast.success('Nova senha gerada com sucesso!');
            // Navegar para a página de edição usando window.location.href
            setTimeout(() => {
              window.location.href = route('admin.users.edit', user.id);
            }, 1000);
          }
        },
        onError: () => {
          toast.error('Erro ao gerar nova senha para o usuário.');
        }
      });
    }
  };

  const handleAdd = () => {
    window.location.href = route('admin.users.create');
  };

  return (
    <AdminLayout title="Usuários">
      <Head title="Usuários" />

        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Usuários</h2>
            <p className="text-muted-foreground">Gerencie todos os usuários da plataforma</p>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Usuário
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>Todos os Usuários</CardTitle>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar usuário..."
                  className="pl-8 w-full sm:w-64"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <select
                value={filterRole}
                onChange={(e) => applyFilters(e.target.value, filterStatus)}
                className="w-full sm:w-44 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">Todos os papéis</option>
                <option value="admin.super">Administradores</option>
                <option value="agency.owner">Agências</option>
                <option value="client.user">Clientes</option>
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => applyFilters(filterRole, e.target.value)}
                className="w-full sm:w-44 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">Todos os status</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
                <option value="unverified">Não verificados</option>
              </select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Papel</TableHead>
                    <TableHead>Vinculado a</TableHead>
                    <TableHead>Verificado em</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                        {searchTerm ? 'Nenhum usuário encontrado para a busca.' : 'Nenhum usuário cadastrado.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.data.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{getRoleBadge(user.roles)}</TableCell>
                        <TableCell>
                          {user.client ? (
                            <Link 
                              href={route('admin.clients.show', user.client.id)} 
                              className="text-green-600 hover:text-green-800 underline flex items-center"
                            >
                              <span>Cliente: {user.client.name}</span>
                            </Link>
                          ) : user.agency ? (
                            <Link 
                              href={route('admin.agencies.show', user.agency.id)} 
                              className="text-blue-600 hover:text-blue-800 underline flex items-center"
                            >
                              <span>Agência: {user.agency.name}</span>
                            </Link>
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
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.is_active 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                            }`}>
                            {user.is_active ? 'Ativo' : 'Inativo'}
                          </span>
                        </TableCell>
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
                              
                              <DropdownMenuItem asChild>
                                <Link href={route('admin.users.edit', user.id)}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  <span>Editar</span>
                                </Link>
                              </DropdownMenuItem>
                              
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
                                onClick={() => generateUserPassword(user)}
                                disabled={processing}
                              >
                                <Key className="mr-2 h-4 w-4" />
                                <span>Gerar nova senha</span>
                              </DropdownMenuItem>
                              
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
                              
                              <DropdownMenuSeparator />
                              
                              <DropdownMenuItem 
                                onClick={() => handleDelete(user)}
                                disabled={processing}
                                className="text-red-600"
                              >
                                <UserX className="mr-2 h-4 w-4" />
                                <span>Excluir</span>
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
            {users.links && users.links.length > 3 && (
              <div className="mt-4 flex items-center justify-between">
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
                        onClick={() => link.url && (window.location.href = link.url)}
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
                    onClick={() => users.prev_page_url && (window.location.href = users.prev_page_url)}
                    disabled={!users.prev_page_url}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => users.next_page_url && (window.location.href = users.next_page_url)}
                    disabled={!users.next_page_url}
                  >
                    Próximo
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
    </AdminLayout>
  );
} 